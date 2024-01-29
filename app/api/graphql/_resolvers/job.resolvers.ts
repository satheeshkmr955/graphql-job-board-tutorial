import { invalidateOperationsCache } from "@/lib/redis";
import {
  InvalidInputError,
  NotFoundError,
  UserNotFoundError,
} from "@/lib/errors";

import { JobsDocument } from "@/gql/graphql";
import { Resolvers } from "@/gql/types";

export const JobResolvers: Resolvers = {
  Query: {
    jobs: async (_, { input }, { db }) => {
      const pagination = {
        totalRecords: 0,
        currentLimit: 0,
        currentPage: 0,
        hasNextPage: false,
      };

      let defaultLimit = 20;
      let defaultPage = 0;

      let { limit, page } = input || {};
      if (typeof limit === "number") {
        defaultLimit = limit;
      }
      if (typeof page === "number") {
        defaultPage = page;
      }

      pagination["totalRecords"] = await db.job.count();
      pagination["currentLimit"] = defaultLimit;
      pagination["currentPage"] = defaultPage;

      const jobs = await db.job.findMany({
        skip: defaultPage * defaultLimit,
        take: defaultLimit + 1,
        orderBy: { createdAt: "desc" },
      });

      if (jobs.length > defaultLimit) {
        pagination["hasNextPage"] = true;
        jobs.splice(-1);
      }

      return { items: jobs, pagination };
    },
    job: async (_, { id }, { db }) => {
      const job = await db.job.findUnique({ where: { id } });

      if (!job) {
        throw NotFoundError(`No Job found with id ${id}`);
      }

      return job;
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
    company: async ({ companyId }, {}, { companyLoader }) => {
      const company = await companyLoader.load(companyId);
      return company;
    },
  },
};
