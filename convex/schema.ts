import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Locations represent physical spaces (home, office, storage unit)
  locations: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    userId: v.id("users"),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Containers represent storage within locations (drawer, box, shelf, closet)
  containers: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    locationId: v.id("locations"),
    parentContainerId: v.optional(v.id("containers")), // for nested containers
    userId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_location", ["locationId"])
    .index("by_parent", ["parentContainerId"]),

  // Items are the actual physical things we're tracking
  items: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    quantity: v.optional(v.number()),
    containerId: v.id("containers"),
    userId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_container", ["containerId"]),
});
