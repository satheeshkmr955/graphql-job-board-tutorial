"use client";

import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { redirect, usePathname } from "next/navigation";

import type { Session } from "next-auth";

type AuthProviderProps = {
  session: Session | null;
  children: React.ReactNode;
};

export const AuthProvider = (props: AuthProviderProps) => {
  const { session, children } = props;

  const pathName = usePathname();

  useEffect(() => {
    if (session === null && pathName !== "/login") {
      redirect("/login");
    }
  }, [session, pathName]);

  return <SessionProvider session={session}>{children}</SessionProvider>;
};
