import { NotFoundError } from "@/lib/errors";

import { Resolvers } from "@/gql/types";

export const CompanyResolvers: Resolvers = {
  Query: {
    company: async (_, { id }, { db }) => {
      const company = await db.company.findUnique({ where: { id } });

      if (!company) {
        throw NotFoundError(`No Company found with id ${id}`);
      }

      return company;
    },
  },
  Company: {
    jobs: async ({ id }, {}, { db }) =>
      await db.job.findMany({ where: { companyId: id } }),
  },
};
