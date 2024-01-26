"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { formatDate } from "@/lib/formatters";
import { useGraphQL } from "@/hooks/use-graphql";
import { JobDocument } from "@/gql/graphql";

const JobIdPage = () => {
  const params = useParams<{ jobId: string }>();
  const { jobId } = params;

  const { data, isLoading } = useGraphQL(JobDocument, { id: jobId });

  return (
    <>
      {!isLoading && (
        <div>
          <div className="flex">
            <h1 className="title is-2">{data?.data?.job?.title}</h1>
            <Link className="ml-4" href={"/"}>
              Home
            </Link>
          </div>
          <h2 className="subtitle is-4">
            <Link href={`/companies/${data?.data?.job?.company?.id}`}>
              {data?.data?.job?.company?.name}
            </Link>
          </h2>
          <div className="box">
            {data?.data?.job?.date && (
              <div className="block has-text-grey">
                Posted:{" "}
                {formatDate({
                  dateStr: data?.data?.job?.date,
                  style: "long",
                })}
              </div>
            )}
            <p className="block">{data?.data?.job?.description}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default JobIdPage;
