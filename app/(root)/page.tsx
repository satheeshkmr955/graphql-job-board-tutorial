"use client";

import { JobList } from "@/components/JobList";

import { JobsDocument } from "@/gql/graphql";
import { useGraphQL } from "@/hooks/use-graphql";

const HomePage = () => {
  const { data } = useGraphQL(JobsDocument);

  return (
    <div>
      <h1 className="title">Job Board</h1>
      <JobList jobs={data?.data?.jobs || []} />
    </div>
  );
};

export default HomePage;
