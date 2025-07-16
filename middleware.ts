import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Add middleware logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
)

export const config = {
  matcher: ["/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)"],
}
