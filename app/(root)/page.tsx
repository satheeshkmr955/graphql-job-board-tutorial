"use client";
import Link from "next/link";

import { JobList } from "@/components/JobList";

import { JobsDocument } from "@/gql/graphql";
import { useGraphQL } from "@/hooks/use-graphql";

const HomePage = () => {
  const { data } = useGraphQL(JobsDocument, { input: { limit: 20, page: 0 } });

  return (
    <div>
      <div className="flex">
        <h1 className="title">Job Board</h1>
        <Link className="ml-4" href={"/jobs/new"}>
          New Job
        </Link>
      </div>
      <JobList jobs={data?.data?.jobs?.items || []} />
    </div>
  );
};

export default HomePage;
