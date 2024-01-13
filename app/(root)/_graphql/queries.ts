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

const getCompanyById = graphql(/* GraphQL */ `
  query Company($id: ID!) {
    company(id: $id) {
      id
      name
      description
      jobs {
        id
        date
        description
        title
      }
    }
  }
`);

const createJob = graphql(/* GraphQL */ `
  mutation CreateJob($input: CreateJobInput!) {
    job: createJob(input: $input) {
      id
    }
  }
`);

const updateJob = graphql(/* GraphQL */ `
  mutation UpdateJob($input: UpdateJobInput!) {
    updateJob(input: $input) {
      id
      title
      description
    }
  }
`);

const deleteJob = graphql(/* GraphQL */ `
  mutation DeleteJob($input: DeleteJobInput!) {
    deleteJob(input: $input) {
      id
      title
      description
    }
  }
`);
