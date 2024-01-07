import { readFileSync } from "fs";
import { join } from "path";
import type { Company, PrismaClient } from "@prisma/client";
import { createSchema, createYoga } from "graphql-yoga";
import { NextRequest, NextResponse } from "next/server";

import type { Resolvers } from "@/gql/types";

import prisma from "@/lib/prisma";
import { InvalidInputError, NotFoundError } from "@/lib/errors";

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
    job: async (_, { id }, { prisma }) => {
      const job = await prisma.job.findUnique({ where: { id } });

      if (!job) {
        throw NotFoundError(`No Job found with id ${id}`);
      }

      return job;
    },
    company: async (_, { id }, { prisma }) => {
      const company = await prisma.company.findUnique({ where: { id } });

      if (!company) {
        throw NotFoundError(`No Company found with id ${id}`);
      }

      return company;
    },
  },
  Mutation: {
    createJob: async (_, { input }, { prisma }) => {
      const { title, description } = input;

      if (!title || !description) {
        throw InvalidInputError("Please add valid title and description");
      }

      const companyId = "FjcJCHJALA4i";

      const job = await prisma.job.create({
        data: { description, title, companyId },
      });

      return job;
    },
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
  Company: {
    jobs: async ({ id }, {}, { prisma }) =>
      await prisma.job.findMany({ where: { companyId: id } }),
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
