import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/login", "/signup", "/privacy", "/terms", "/forgot-password"],
      disallow: ["/dashboard", "/admin", "/practice", "/mock-exam", "/onboard", "/diagnostic-test"],
    },
  };
}
