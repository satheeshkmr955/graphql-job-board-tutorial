"use client";

import { graphql } from "@/gql/gql";
import { GreetingDocument } from "@/gql/graphql";
import { useGraphQL } from "@/hooks/use-graphql";


export const greeting = graphql(/* GraphQL */ `
  query greeting {
    greeting
  }
`);

const HomePage = () => {
  const { data } = useGraphQL(GreetingDocument);
  return <div>{data?.data?.greeting}</div>;
};

export default HomePage;
