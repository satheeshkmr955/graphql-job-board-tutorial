import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "schema.graphql",
  documents: ["app/**/*{.tsx,.ts}"],
  ignoreNoDocuments: true,
  generates: {
    "gql/types.ts": {
      plugins: ["typescript", "typescript-resolvers"],
    },
    "gql/": {
      preset: "client",
    },
    "./graphql.schema.json": {
      plugins: ["introspection"],
    },
  },
};

export default config;
