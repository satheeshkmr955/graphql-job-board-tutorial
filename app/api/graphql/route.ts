import { readFileSync } from "fs";
import { join } from "path";
import type { Company, PrismaClient } from "@prisma/client";
import { createSchema, createYoga } from "graphql-yoga";
import { NextRequest, NextResponse } from "next/server";

import type { Resolvers } from "@/gql/types";

import prisma from "@/lib/prisma";

export type GraphQLContext = {
  prisma: PrismaClient;
};

export async function createContext(): Promise<GraphQLContext> {
  return {
    prisma,
  };
}

const typeDefs = readFileSync(join(process.cwd(), "schema.graphql"), {
  encoding: "utf-8",
});

const resolvers: Resolvers = {
  Query: {
    greeting: () => "Hello World",
    jobs: async (_, {}, { prisma }) => await prisma.job.findMany(),
    job: async (_, { id }, { prisma }) =>
      await prisma.job.findUnique({ where: { id } }),
    company: async (_, { id }, { prisma }) =>
      await prisma.company.findUnique({ where: { id } }),
  },
  Job: {
    date: ({ createdAt }) => createdAt.toISOString(),
    company: async ({ companyId }, {}, { prisma }) => {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
      });
      return company as Company;
    },
  },
};

const schema = createSchema({
  typeDefs: typeDefs,
  resolvers: resolvers,
});

const { handleRequest } = createYoga({
  graphqlEndpoint: "/graphql",
  schema,
  fetchAPI: {
    Request: NextRequest,
    Response: NextResponse,
  },
  context: createContext(),
});

export { handleRequest as GET, handleRequest as POST };
