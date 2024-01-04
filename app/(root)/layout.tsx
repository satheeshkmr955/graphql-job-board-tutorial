import { QueryProvider } from "@/components/providers/query-provider";

type LayoutProps = {
  children: React.ReactNode;
};

const HomeLayout = (props: LayoutProps) => {
  const { children } = props;
  return <QueryProvider>{children}</QueryProvider>;
};

export default HomeLayout;
