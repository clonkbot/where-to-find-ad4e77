import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listByContainer = query({
  args: { containerId: v.id("containers") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("items")
      .withIndex("by_container", (q) => q.eq("containerId", args.containerId))
      .order("desc")
      .collect();
  },
});

export const search = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const searchLower = args.searchTerm.toLowerCase();

    // Get all user's items
    const items = await ctx.db
      .query("items")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Filter by search term
    const matchedItems = items.filter(item =>
      item.name.toLowerCase().includes(searchLower) ||
      (item.description && item.description.toLowerCase().includes(searchLower))
    );

    // Get container and location info for each matched item
    const results = await Promise.all(matchedItems.map(async (item) => {
      const container = await ctx.db.get(item.containerId);
      if (!container) return null;

      const location = await ctx.db.get(container.locationId);
      if (!location) return null;

      // Build path
      const path: string[] = [location.name];
      let current = container;
      const containerNames: string[] = [];

      while (current.parentContainerId) {
        const parent = await ctx.db.get(current.parentContainerId);
        if (!parent) break;
        containerNames.unshift(parent.name);
        current = parent;
      }

      return {
        ...item,
        path: [...path, ...containerNames, container.name].join(" → "),
        locationId: location._id,
        containerName: container.name,
      };
    }));

    return results.filter(Boolean);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    quantity: v.optional(v.number()),
    containerId: v.id("containers"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("items", {
      name: args.name,
      description: args.description,
      quantity: args.quantity,
      containerId: args.containerId,
      userId,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("items"),
    name: v.string(),
    description: v.optional(v.string()),
    quantity: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const item = await ctx.db.get(args.id);
    if (!item || item.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(args.id, {
      name: args.name,
      description: args.description,
      quantity: args.quantity,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const item = await ctx.db.get(args.id);
    if (!item || item.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});
