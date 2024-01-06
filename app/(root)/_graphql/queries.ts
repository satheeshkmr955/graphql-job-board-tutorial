"use client";

import { graphql } from "@/gql";

const getJobsWithCompany = graphql(/* GraphQL */ `
  query Jobs {
    jobs {
      id
      title
      description
      date
      company {
        id
        name
        description
      }
    }
  }
`);
