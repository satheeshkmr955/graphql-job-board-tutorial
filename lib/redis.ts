import Redis from "ioredis";
import { print } from "graphql";
import { type TypedDocumentNode } from "@graphql-typed-document-node/core";
import { defaultBuildResponseCacheKey } from "@envelop/response-cache";

const redisConnectionSingleton = () => {
  return new Redis(process.env.REDIS_URL!);
};

declare global {
  var redis: undefined | ReturnType<typeof redisConnectionSingleton>;
}

export const redis = globalThis.redis ?? redisConnectionSingleton();

if (process.env.NODE_ENV !== "production") globalThis.redis = redis;

// Invalidate operation from redis
// Since is not available from envelop by default
// Reference https://github.com/dotansimha/graphql-yoga/issues/3125
export const invalidateOperationsCache = async <TResult, TVariables>(
  document: TypedDocumentNode<TResult, TVariables>,
  variables?: TVariables extends Record<string, never> ? {} : TVariables
) => {
  const key = await defaultBuildResponseCacheKey({
    documentString: print(document),
    operationName: null,
    variableValues: variables ? variables : null,
    sessionId: null,
  });

  await redis.del([key]);
};
