"use client";
import { useParams } from "next/navigation";

import { CompanyDocument } from "@/gql/graphql";
import { useGraphQL } from "@/hooks/use-graphql";

import { JobList } from "@/components/JobList";

const CompanyIdPage = () => {
  const params = useParams<{ companyId: string }>();
  const { companyId } = params;

  const { data, isLoading } = useGraphQL(CompanyDocument, { id: companyId });

  return (
    <>
      {!isLoading && (
        <>
          <div>
            <h1 className="title">{data?.data?.company?.name}</h1>
            <div className="box">{data?.data?.company?.description}</div>
          </div>
          <h2 className="title">Jobs at {data?.data?.company?.name}</h2>
          <JobList jobs={data?.data?.company?.jobs || []} />
        </>
      )}
    </>
  );
};

export default CompanyIdPage;
