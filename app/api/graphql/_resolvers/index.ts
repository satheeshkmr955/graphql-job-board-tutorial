import _ from "lodash";

import { Resolvers } from "@/gql/types";

import { JobResolvers } from "./job.resolvers";
import { CompanyResolvers } from "./company.resolvers";
import { GreetingResolvers } from "./greeting.resolvers";
import { TestResolvers } from "./test.resolvers";

export const RootResolvers: Resolvers = _.merge(
  {},
  JobResolvers,
  CompanyResolvers,
  GreetingResolvers,
  TestResolvers
);
