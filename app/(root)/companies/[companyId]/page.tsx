"use client";
import { useParams } from "next/navigation";

import { CompanyDocument } from "@/gql/graphql";
import { useGraphQL } from "@/hooks/use-graphql";

const CompanyIdPage = () => {
  const params = useParams<{ companyId: string }>();
  const { companyId } = params;

  const { data, isLoading } = useGraphQL(CompanyDocument, { id: companyId });

  return (
    <>
      {!isLoading && (
        <div>
          <h1 className="title">{data?.data?.company?.name}</h1>
          <div className="box">{data?.data?.company?.description}</div>
        </div>
      )}
    </>
  );
};

export default CompanyIdPage;
