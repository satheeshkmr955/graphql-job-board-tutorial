import { pubSub } from "@/lib/pubsub";

import { Resolvers } from "@/gql/types";

export const TestResolvers: Resolvers = {
  Subscription: {
    randomNumber: {
      // subscribe to the randomNumber event
      subscribe: () => pubSub.subscribe("randomNumber"),
      resolve: (payload: any) => payload,
    },
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
  Mutation: {
    broadcastRandomNumber: (_, args) => {
      // publish a random number
      pubSub.publish("randomNumber", Math.floor(Math.random() * 100));
      return true;
    },
  },
};
