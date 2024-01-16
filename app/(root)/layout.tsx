import { getServerSession } from "next-auth";

import { AuthProvider } from "@/components/providers/auth-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { authConfigOptions } from "@/lib/auth";

type LayoutProps = {
  children: React.ReactNode;
};

const getSession = async () => {
  return await getServerSession(authConfigOptions);
};

const HomeLayout = async (props: LayoutProps) => {
  const { children } = props;

  const session = await getSession();

  return (
    <AuthProvider session={session}>
      <QueryProvider>{children}</QueryProvider>
    </AuthProvider>
  );
};

export default HomeLayout;
