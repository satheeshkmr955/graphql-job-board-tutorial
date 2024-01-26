"use client";

import { graphql } from "@/gql";

export const JobDetails = graphql(/* GraphQL */ `
  fragment JobDetails on Job {
    id
    title
    description
    date
  }
`);

export const CompanyDetails = graphql(/* GraphQL */ `
  fragment CompanyDetails on Company {
    id
    name
    description
  }
`);

export const getJobsWithCompany = graphql(/* GraphQL */ `
  query Jobs {
    jobs {
      ...JobDetails
      company {
        ...CompanyDetails
      }
    }
  }
`);

export const getJobById = graphql(/* GraphQL */ `
  query Job($id: ID!) {
    job(id: $id) {
      ...JobDetails
      company {
        ...CompanyDetails
      }
    }
  }
`);

export const getCompanyById = graphql(/* GraphQL */ `
  query Company($id: ID!) {
    company(id: $id) {
      ...CompanyDetails
      jobs {
        ...JobDetails
      }
    }
  }
`);

export const createJob = graphql(/* GraphQL */ `
  mutation CreateJob($input: CreateJobInput!) {
    job: createJob(input: $input) {
      ...JobDetails
    }
  }
`);

export const updateJob = graphql(/* GraphQL */ `
  mutation UpdateJob($input: UpdateJobInput!) {
    updateJob(input: $input) {
      ...JobDetails
    }
  }
`);

export const deleteJob = graphql(/* GraphQL */ `
  mutation DeleteJob($input: DeleteJobInput!) {
    deleteJob(input: $input) {
      ...JobDetails
    }
  }
`);
