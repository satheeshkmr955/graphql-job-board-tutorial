"use client";

import { useState } from "react";
import { ExecutionResult } from "graphql";
import { useRouter } from "next/navigation";

import { useMutationGraphQL } from "@/hooks/use-graphql";
import { CreateJobDocument, CreateJobMutation } from "@/gql/graphql";

const JobNewPage = () => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const { mutate } = useMutationGraphQL(
    CreateJobDocument,
    {
      input: { title, description },
    },
    {
      onSuccess: <T extends ExecutionResult<CreateJobMutation>>(data: T) => {
        const id = data.data?.job?.id;
        if (id) {
          router.push(id);
        }
      },
    }
  );

  const handleSubmit = async (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    mutate({});
  };

  return (
    <div>
      <h1 className="title">New Job</h1>
      <div className="box">
        <form>
          <div className="field">
            <label className="label">Title</label>
            <div className="control">
              <input
                className="input"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label className="label">Description</label>
            <div className="control">
              <textarea
                className="textarea"
                rows={10}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <div className="control">
              <button className="button is-link" onClick={handleSubmit}>
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobNewPage;
