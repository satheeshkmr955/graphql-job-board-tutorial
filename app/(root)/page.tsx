"use client";
import Link from "next/link";
import { print } from "graphql";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useEffect, useState } from "react";
import { v4 as uuidV4 } from "uuid";

import { JobList } from "@/components/JobList";

import { JobsDocument, SubscriptionRandomNumberDocument } from "@/gql/graphql";
import { getCacheKey, useGraphQL } from "@/hooks/use-graphql";

const SOCKET_URL = "ws://localhost:3000/subscription";
const PROTOCOL = "graphql-transport-ws";

const WEB_SOCKET_TYPES = {
  CONNECTION_INIT: "connection_init",
  SUBSCRIBE: "subscribe",
  COMPLETE: "complete",
  CONNECTION_ACK: "connection_ack",
};

const operationName = getCacheKey(SubscriptionRandomNumberDocument);

const HomePage = () => {
  const { data } = useGraphQL(JobsDocument, { input: { limit: 20, page: 0 } });

  const [id, setId] = useState(uuidV4());

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    SOCKET_URL,
    {
      share: true,
      protocols: PROTOCOL,
      onMessage: (event) => {
        const data = JSON.parse(event.data);
        if (data?.type === WEB_SOCKET_TYPES.CONNECTION_ACK) {
          sendJsonMessage({
            id,
            type: `${WEB_SOCKET_TYPES.SUBSCRIBE}`,
            payload: {
              query: print(SubscriptionRandomNumberDocument),
              operationName: `${operationName}`,
              extensions: {},
            },
          });
        } else {
          console.log(event);
        }
      },
    }
  );

  useEffect(() => {
    if (readyState === ReadyState.OPEN) {
      sendJsonMessage({
        id,
        type: `${WEB_SOCKET_TYPES.CONNECTION_INIT}`,
      });
    }
  }, [readyState, sendJsonMessage, id]);

  useEffect(() => {
    if (lastJsonMessage !== null) {
      console.log({ lastJsonMessage });
    }
  }, [lastJsonMessage]);

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
