declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
      department: string
      employeeId: string
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role: string
    department: string
    employeeId: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    department: string
    employeeId: string
  }
}
