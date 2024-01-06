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

const getJobById = graphql(/* GraphQL */ `
  query Job($id: ID!) {
    job(id: $id) {
      date
      id
      title
      description
      company {
        id
        name
        description
      }
    }
  }
`);
