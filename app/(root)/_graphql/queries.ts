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

export const JobWithCompanyDetails = graphql(/* GraphQL */ `
  fragment JobWithCompanyDetails on Job {
    ...JobDetails
    company {
      ...CompanyDetails
    }
  }
`);

export const CompanyWithJobDetails = graphql(/* GraphQL */ `
  fragment CompanyWithJobDetails on Company {
    ...CompanyDetails
    jobs {
      ...JobDetails
    }
  }
`);

export const getJobsWithCompany = graphql(/* GraphQL */ `
  query Jobs($input: JobsInput) {
    jobs(input: $input) {
      items {
        ...JobWithCompanyDetails
      }
      pagination {
        totalRecords
        currentLimit
        currentPage
        hasNextPage
      }
    }
  }
`);

export const getJobById = graphql(/* GraphQL */ `
  query Job($id: ID!) {
    job(id: $id) {
      ...JobWithCompanyDetails
    }
  }
`);

export const getCompanyById = graphql(/* GraphQL */ `
  query Company($id: ID!) {
    company(id: $id) {
      ...CompanyWithJobDetails
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

export const subscriptionRandomNumber = graphql(/* GraphQL */ `
  subscription SubscriptionRandomNumber {
    randomNumber
  }
`);

export const subscriptionPing = graphql(/* GraphQL */ `
  subscription SubscriptionPing {
    ping
  }
`);
