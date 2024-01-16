import { readFileSync } from "fs";
import { join } from "path";
import { createSchema, createYoga } from "graphql-yoga";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import type { Company, PrismaClient } from "@prisma/client";

import type { Resolvers } from "@/gql/types";

import { db } from "@/lib/db";
import {
  InvalidInputError,
  InvalidTokenError,
  NotFoundError,
  UserNotFoundError,
} from "@/lib/errors";

export type ContextType = {
  request: NextRequest;
};

export interface GraphQLContext extends ContextType {
  db: PrismaClient;
}

export async function createContext(
  defaultContext: ContextType
): Promise<GraphQLContext> {
  return {
    ...defaultContext,
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
    createJob: async (_, { input }, { db, request }) => {
      const { title, description } = input;

      const token = await getToken({ req: request });

      if (!token) {
        throw InvalidTokenError("Please add valid token");
      }

      const user = await db.user.findUnique({
        where: {
          email: token.email!,
        },
        select: {
          companyId: true,
        },
      });

      if (!user) {
        throw UserNotFoundError("User not found");
      }

      if (!title || !description) {
        throw InvalidInputError("Please add valid title and description");
      }

      const job = await db.job.create({
        data: { description, title, companyId: user.companyId },
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
  context: createContext,
});

export { handleRequest as GET, handleRequest as POST };
