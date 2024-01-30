import { Resolvers } from "@/gql/types";

export const ClockResolvers: Resolvers = {
  Subscription: {
    clock: {
      async *subscribe(): AsyncGenerator<{ clock: string }> {
        for (let i = 0; i < 5; i++) {
          yield { clock: new Date().toString() };
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      },
    },
    ping: {
      async *subscribe(): AsyncGenerator<{ ping: string }> {
        yield { ping: "pong" };
      },
    },
  },
};
