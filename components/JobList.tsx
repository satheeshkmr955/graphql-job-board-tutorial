import Link from "next/link";

import { Company, Job } from "@/gql/graphql";
import { formatDate } from "@/lib/formatters";

interface JobWithCompany extends Job {
  company: Company;
}

export type JobItemProps = {
  job: JobWithCompany;
};

export type JobListProps = {
  jobs: JobWithCompany[];
};

export const JobList = (props: JobListProps) => {
  const { jobs } = props;

  return (
    <ul className="box">
      {jobs.map((job) => (
        <JobItem key={job.id} job={job} />
      ))}
    </ul>
  );
};

export const JobItem = (props: JobItemProps) => {
  const { job } = props;
  const title = job.company ? `${job.title} at ${job.company.name}` : job.title;

  return (
    <li className="media">
      <div className="media-left has-text-grey">
        {formatDate({ dateStr: job.date })}
      </div>
      <div className="media-content">
        <Link href={`/jobs/${job.id}`}>{title}</Link>
      </div>
    </li>
  );
};

