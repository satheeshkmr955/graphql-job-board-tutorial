import Redis from "ioredis";

const redisConnectionSingleton = () => {
  return new Redis(process.env.REDIS_URL!);
};

declare global {
  var publishClientRedis:
    | undefined
    | ReturnType<typeof redisConnectionSingleton>;
  var subscribeClientRedis:
    | undefined
    | ReturnType<typeof redisConnectionSingleton>;
}

export const publishClientRedis =
  globalThis.publishClientRedis ?? redisConnectionSingleton();
export const subscribeClientRedis =
  globalThis.subscribeClientRedis ?? redisConnectionSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.publishClientRedis = publishClientRedis;
  globalThis.subscribeClientRedis = subscribeClientRedis;
}
