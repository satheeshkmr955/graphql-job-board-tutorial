import NextAuth from "next-auth";

import { authConfigOptions } from "@/lib/auth";

const handler = NextAuth(authConfigOptions);

export { handler as GET, handler as POST };
