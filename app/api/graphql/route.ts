/* eslint-disable react-hooks/rules-of-hooks */
import { readFileSync } from "fs";
import { join } from "path";
import { createSchema, createYoga } from "graphql-yoga";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
// import { useLogger } from "@envelop/core";
import { useResponseCache } from "@envelop/response-cache";
import { createRedisCache } from "@envelop/response-cache-redis";

import type { Company, PrismaClient, User } from "@prisma/client";

import type { Resolvers } from "@/gql/types";

import { db } from "@/lib/db";
import { invalidateOperationsCache, redis } from "@/lib/redis";
import { logger } from "@/lib/logger";
import {
  InvalidInputError,
  NotFoundError,
  UserNotFoundError,
} from "@/lib/errors";

import { JobsDocument } from "@/gql/graphql";

export type ContextType = {
  request: NextRequest;
  user: User | null;
};

export interface GraphQLContext extends ContextType {
  db: PrismaClient;
}

export async function createContext(
  defaultContext: ContextType
): Promise<GraphQLContext> {
  const { request } = defaultContext;

  const token = await getToken({ req: request });

  let user = null;

  if (token) {
    user = await db.user.findUnique({
      where: {
        id: token.sub!,
      },
      select: {
        companyId: true,
      },
    });
  }

  return {
    ...defaultContext,
    db,
    user,
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
    createJob: async (_, { input }, { db, user }) => {
      const { title, description } = input;

      if (!user) {
        throw UserNotFoundError("User not found");
      }

      if (!title || !description) {
        throw InvalidInputError("Please add valid title and description");
      }

      const job = await db.job.create({
        data: { description, title, companyId: user.companyId },
      });

      invalidateOperationsCache(JobsDocument);

      return job;
    },
    updateJob: async (_, { input }, { db, user }) => {
      const { description = null, title = null, id = null } = input;

      if (!user) {
        throw UserNotFoundError("User not found");
      }

      if (id === null) {
        throw InvalidInputError("Please add valid id");
      }

      const isJobExists = await db.job.findUnique({
        where: { id, companyId: user?.companyId },
      });

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
    deleteJob: async (_, { input }, { db, user }) => {
      const { id = null } = input;

      if (!user) {
        throw UserNotFoundError("User not found");
      }

      if (id === null) {
        throw InvalidInputError("Please add valid id");
      }

      const isJobExists = await db.job.findUnique({
        where: { id, companyId: user?.companyId },
      });

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

export const cache = createRedisCache({ redis });

const { handleRequest } = createYoga({
  graphqlEndpoint: "/api/graphql",
  schema,
  logging: {
    debug(...args) {
      logger.debug(args);
    },
    info(...args) {
      logger.info(args);
    },
    warn(...args) {
      logger.warn(args);
    },
    error(...args) {
      logger.error(args);
    },
  },
  fetchAPI: {
    Request: NextRequest,
    Response: NextResponse,
  },
  context: createContext,
  plugins: [
    // useLogger({
    //   logFn: (eventName, args) => {
    //     logger.debug({ eventName, args });
    //   },
    // }),
    useResponseCache({
      cache,
      session: () => null,
      ttlPerSchemaCoordinate: {
        "Query.jobs": 1000 * 60 * 5,
      },
      // includeExtensionMetadata: false,
      // ttl: 1000 * 60 * 60 * 1,
    }),
  ],
});

export { handleRequest as GET, handleRequest as POST };
