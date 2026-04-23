import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("locations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("locations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const location = await ctx.db.get(args.id);
    if (!location || location.userId !== userId) return null;
    return location;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("locations", {
      name: args.name,
      description: args.description,
      userId,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("locations"),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const location = await ctx.db.get(args.id);
    if (!location || location.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(args.id, {
      name: args.name,
      description: args.description,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("locations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const location = await ctx.db.get(args.id);
    if (!location || location.userId !== userId) throw new Error("Not found");

    // Delete all containers in this location
    const containers = await ctx.db
      .query("containers")
      .withIndex("by_location", (q) => q.eq("locationId", args.id))
      .collect();

    for (const container of containers) {
      // Delete all items in each container
      const items = await ctx.db
        .query("items")
        .withIndex("by_container", (q) => q.eq("containerId", container._id))
        .collect();
      for (const item of items) {
        await ctx.db.delete(item._id);
      }
      await ctx.db.delete(container._id);
    }

    await ctx.db.delete(args.id);
  },
});
