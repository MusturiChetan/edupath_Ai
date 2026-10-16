import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

describe("App routing", () => {
  const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

  const routes = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/dashboard",
    "/onboarding",
    "/weak-topics",
    "/roadmap",
    "/careers",
    "/ask",
    "/api/ask",
    "/profile",
  ];

  routes.forEach((path) => {
    it(`matches a page for ${path} without falling back to root not-found`, () => {
      const matches = router.matchRoutes(path);
      expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
      expect(matches.length).toBeGreaterThan(0);
    });
  });
});
