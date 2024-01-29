import { Resolvers } from "@/gql/types";

export const GreetingResolvers: Resolvers = {
  Query: {
    greeting: () => "Hello World",
  },
};
