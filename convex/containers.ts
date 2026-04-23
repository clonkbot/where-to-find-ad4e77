import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listByLocation = query({
  args: { locationId: v.id("locations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("containers")
      .withIndex("by_location", (q) => q.eq("locationId", args.locationId))
      .order("desc")
      .collect()
      .then(containers => containers.filter(c => !c.parentContainerId));
  },
});

export const listByParent = query({
  args: { parentContainerId: v.id("containers") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("containers")
      .withIndex("by_parent", (q) => q.eq("parentContainerId", args.parentContainerId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("containers") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const container = await ctx.db.get(args.id);
    if (!container || container.userId !== userId) return null;
    return container;
  },
});

export const getPath = query({
  args: { id: v.id("containers") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const container = await ctx.db.get(args.id);
    if (!container || container.userId !== userId) return null;

    const location = await ctx.db.get(container.locationId);
    if (!location) return null;

    const path: Array<{ id: string; name: string; type: "location" | "container" }> = [
      { id: location._id, name: location.name, type: "location" }
    ];

    // Walk up the parent chain
    let current = container;
    const containerPath: Array<{ id: string; name: string; type: "location" | "container" }> = [];

    while (current.parentContainerId) {
      const parent = await ctx.db.get(current.parentContainerId);
      if (!parent) break;
      containerPath.unshift({ id: parent._id, name: parent.name, type: "container" });
      current = parent;
    }

    return [...path, ...containerPath, { id: container._id, name: container.name, type: "container" }];
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    locationId: v.id("locations"),
    parentContainerId: v.optional(v.id("containers")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("containers", {
      name: args.name,
      description: args.description,
      locationId: args.locationId,
      parentContainerId: args.parentContainerId,
      userId,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("containers"),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const container = await ctx.db.get(args.id);
    if (!container || container.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(args.id, {
      name: args.name,
      description: args.description,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("containers") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const container = await ctx.db.get(args.id);
    if (!container || container.userId !== userId) throw new Error("Not found");

    // Recursively delete child containers
    const children = await ctx.db
      .query("containers")
      .withIndex("by_parent", (q) => q.eq("parentContainerId", args.id))
      .collect();

    for (const child of children) {
      // Delete items in child
      const childItems = await ctx.db
        .query("items")
        .withIndex("by_container", (q) => q.eq("containerId", child._id))
        .collect();
      for (const item of childItems) {
        await ctx.db.delete(item._id);
      }
      await ctx.db.delete(child._id);
    }

    // Delete items in this container
    const items = await ctx.db
      .query("items")
      .withIndex("by_container", (q) => q.eq("containerId", args.id))
      .collect();
    for (const item of items) {
      await ctx.db.delete(item._id);
    }

    await ctx.db.delete(args.id);
  },
});
