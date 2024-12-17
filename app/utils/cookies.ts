import { createCookie } from "@remix-run/node";

export const netlifyTokenCookie = createCookie("netlify_token", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 30 * 24 * 60 * 60, // 30 days
}); 