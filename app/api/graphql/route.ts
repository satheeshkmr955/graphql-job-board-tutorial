import { readFileSync } from "fs";
import { join } from "path";
import type { Company, PrismaClient } from "@prisma/client";
import { createSchema, createYoga } from "graphql-yoga";
import { NextRequest, NextResponse } from "next/server";

import type { Resolvers } from "@/gql/types";

import { db } from "@/lib/db";
import { InvalidInputError, NotFoundError } from "@/lib/errors";

export type GraphQLContext = {
  db: PrismaClient;
};

export async function createContext(): Promise<GraphQLContext> {
  return {
    db,
  };
}

const typeDefs = readFileSync(join(process.cwd(), "schema.graphql"), {
  encoding: "utf-8",
});

const resolvers: Resolvers = {
  Query: {
    greeting: () => "Hello World",
    jobs: async (_, {}, { db }) => await db.job.findMany(),
    job: async (_, { id }, { db }) => {
      const job = await db.job.findUnique({ where: { id } });

      if (!job) {
        throw NotFoundError(`No Job found with id ${id}`);
      }

      return job;
    },
    company: async (_, { id }, { db }) => {
      const company = await db.company.findUnique({ where: { id } });

      if (!company) {
        throw NotFoundError(`No Company found with id ${id}`);
      }

      return company;
    },
  },
  Mutation: {
    createJob: async (_, { input }, { db }) => {
      const { title, description } = input;

      if (!title || !description) {
        throw InvalidInputError("Please add valid title and description");
      }

      const companyId = "FjcJCHJALA4i";

      const job = await db.job.create({
        data: { description, title, companyId },
      });

      return job;
    },
    updateJob: async (_, { input }, { db }) => {
      const { description = null, title = null, id = null } = input;

      if (id === null) {
        throw InvalidInputError("Please add valid id");
      }

      const isJobExists = await db.job.findUnique({ where: { id } });

      if (!isJobExists) {
        throw NotFoundError(`No Job found with id ${id}`);
      }

      const job = await db.job.update({
        where: { id },
        data: {
          description: description ? description : isJobExists.description,
          title: title ? title : isJobExists.title,
        },
      });

      return job;
    },
    deleteJob: async (_, { input }, { db }) => {
      const { id = null } = input;

      if (id === null) {
        throw InvalidInputError("Please add valid id");
      }

      const isJobExists = await db.job.findUnique({ where: { id } });

      if (!isJobExists) {
        throw NotFoundError(`No Job found with id ${id}`);
      }

      await db.job.delete({ where: { id } });

      return isJobExists;
    },
  },
  Job: {
    date: ({ createdAt }) => createdAt.toISOString(),
    company: async ({ companyId }, {}, { db }) => {
      const company = await db.company.findUnique({
        where: { id: companyId },
      });
      return company as Company;
    },
  },
  Company: {
    jobs: async ({ id }, {}, { db }) =>
      await db.job.findMany({ where: { companyId: id } }),
  },
};

const schema = createSchema({
  typeDefs: typeDefs,
  resolvers: resolvers,
});

const { handleRequest } = createYoga({
  graphqlEndpoint: "/api/graphql",
  schema,
  fetchAPI: {
    Request: NextRequest,
    Response: NextResponse,
  },
  context: createContext(),
});

export { handleRequest as GET, handleRequest as POST };
