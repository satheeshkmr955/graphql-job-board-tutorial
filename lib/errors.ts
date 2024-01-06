import { GraphQLError } from "graphql";

export const NotFoundError = (message: string) => {
  return new GraphQLError(message, {
    extensions: { code: "NOT_FOUND" },
  });
};
