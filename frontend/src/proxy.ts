import { NextResponse, type NextRequest } from "next/server";

import { AUTH_LOGIN_PATH, AUTH_REGISTER_PATH, safeNextPath } from "@/lib/auth/redirect";
import { sessionConfig } from "@/lib/config";

/**
 * Guard de navegacion (file convention `proxy`, antes `middleware`).
 *
 * - Exige sesion para `/checkout` y `/orders`, redirigiendo a /login con `next`.
 * - Evita que un usuario autenticado vuelva a /login o /register.
 *
 * La cookie es httpOnly, por lo que su presencia es verificable aqui sin
 * exponer el token al cliente. La autorizacion real vuelve a validarse en cada
 * Server Action y Route Handler contra la API.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(sessionConfig.tokenCookie);

  const isCheckoutFlow = pathname === "/checkout" || pathname.startsWith("/checkout/");
  const isCheckoutResult = pathname === "/checkout/success" || pathname === "/checkout/cancel";
  const isProtected =
    pathname === "/orders" ||
    pathname.startsWith("/orders/") ||
    (isCheckoutFlow && !isCheckoutResult);

  if (isProtected && !hasSession) {
    const loginUrl = new URL(AUTH_LOGIN_PATH, request.url);
    loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    loginUrl.searchParams.set("reason", "session-required");

    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && (pathname === AUTH_LOGIN_PATH || pathname === AUTH_REGISTER_PATH)) {
    const next = safeNextPath(request.nextUrl.searchParams.get("next"), "/orders");

    return NextResponse.redirect(new URL(next, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Todo excepto la API interna, assets de Next, el optimizador de imagenes y
    // archivos estaticos (png, jpg, svg, webp, ico, txt, xml, webmanifest).
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpe?g|svg|webp|avif|ico|txt|xml|webmanifest)$).*)",
  ],
};
