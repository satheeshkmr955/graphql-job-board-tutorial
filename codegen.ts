import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "schema.graphql",
  documents: ["app/**/*{.tsx,.ts}"],
  ignoreNoDocuments: true,
  generates: {
    "gql/types.ts": {
      config: {
        mapperTypeSuffix: "Modal",
        mappers: {
          Company: "@prisma/client#Company",
          Job: "@prisma/client#Job",
          User: "@prisma/client#User",
        },
        contextType: "../app/api/graphql/route#GraphQLContext",
      },
      plugins: ["typescript", "typescript-resolvers"],
    },
    "gql/": {
      preset: "client",
      presetConfig: {
        fragmentMasking: false,
      },
    },
    "./graphql.schema.json": {
      plugins: ["introspection"],
    },
  },
};

export default config;
