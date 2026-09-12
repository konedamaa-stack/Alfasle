import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static asset files with extensions (.svg, .png, .jpg, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)",
  ],
};

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "localhost:3000";

  // Remove port for local testing (e.g., polytech-kone.localhost:3000 -> polytech-kone.localhost)
  const hostWithoutPort = hostname.split(":")[0].toLowerCase();
  const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "alfasle.xyz").toLowerCase();

  let subdomain = "";

  // 1. Localhost support: e.g. "polytech-kone.localhost"
  if (hostWithoutPort.endsWith(".localhost")) {
    subdomain = hostWithoutPort.replace(".localhost", "");
  }
  // 2. Vercel deployment support: e.g. "raya1.alfasle.vercel.app"
  else if (hostWithoutPort.endsWith(".vercel.app")) {
    const vParts = hostWithoutPort.split(".");
    // Only extract subdomain if 4+ parts (e.g. raya1.alfasle.vercel.app)
    if (vParts.length >= 4) {
      subdomain = vParts[0];
    } else {
      subdomain = "";
    }
  }
  // 3. Production with Root Domain: e.g. "polytech-kone.alfasle.xyz"
  else if (rootDomain && hostWithoutPort.endsWith(`.${rootDomain}`)) {
    subdomain = hostWithoutPort.replace(`.${rootDomain}`, "");
  }
  // 4. Fallback for custom multi-part domains: "subdomain.example.com"
  else if (hostWithoutPort.includes(".")) {
    const parts = hostWithoutPort.split(".");
    if (parts.length >= 3) {
      subdomain = parts[0];
    }
  }

  // Exclude system subdomains like "www", "app", "api", "admin"
  if (subdomain === "www" || subdomain === "app" || subdomain === "api") {
    subdomain = "";
  }

  // If a valid school subdomain is detected, rewrite internally to /e/[subdomain]
  if (subdomain && !url.pathname.startsWith("/e/") && !url.pathname.startsWith("/super-admin")) {
    return NextResponse.rewrite(
      new URL(`/e/${subdomain}${url.pathname === "/" ? "" : url.pathname}`, req.url)
    );
  }

  return NextResponse.next();
}
