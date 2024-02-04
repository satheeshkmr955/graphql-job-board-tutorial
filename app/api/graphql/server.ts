/* eslint-disable react-hooks/rules-of-hooks */
import { readFileSync } from "fs";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { parse, UrlWithParsedQuery } from "url";
import next from "next";
import { join } from "path";
import { createSchema, createYoga } from "graphql-yoga";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import DataLoader from "dataloader";
// import { useLogger } from "@envelop/core";
import { useResponseCache } from "@envelop/response-cache";
import { createRedisCache } from "@envelop/response-cache-redis";
import { useDataLoader } from "@envelop/dataloader";

import type { ExecutionArgs } from "graphql";
import type { Company, PrismaClient, User } from "@prisma/client";

import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { logger } from "@/lib/logger";

import { RootResolvers } from "./_resolvers";

interface CustomerExecutionArgs extends ExecutionArgs {
  rootValue?: any;
  contextValue?: any;
}

export type ContextType = {
  request: NextRequest;
  req?: NextRequest;
  user: User | null;
  companyLoader: CompanyLoader;
};

export interface CompanyLoader {
  load(key: string): Promise<Company>;
}

export interface GraphQLContext extends ContextType {
  db: PrismaClient;
}

const dev: boolean = process.env.NODE_ENV !== "production";
const hostname: string = "localhost";
const port: number = 3000;
const graphqlEndpoint: string = "/subscription";
const webpackEndpoint: string = "/_next/webpack-hmr";

const app = next({ dev, hostname, port });

export async function createContext(
  defaultContext: ContextType
): Promise<GraphQLContext> {
  const { request, req } = defaultContext;

  const token = await getToken({
    req: request ? request : req!,
  });

  let user = null;

  if (token) {
    user = await db.user.findUnique({
      where: {
        id: token.sub!,
      },
    });
  }

  return {
    ...defaultContext,
    db,
    user,
  };
}

const typeDefs = readFileSync(join(process.cwd(), "schema.graphql"), {
  encoding: "utf-8",
});

const schema = createSchema({
  typeDefs: typeDefs,
  resolvers: RootResolvers,
});

export const cache = createRedisCache({ redis });

const yoga = createYoga({
  graphqlEndpoint,
  graphiql: {
    subscriptionsProtocol: "WS",
  },
  schema,
  logging: {
    debug(...args) {
      logger.debug(args);
    },
    info(...args) {
      logger.info(args);
    },
    warn(...args) {
      logger.warn(args);
    },
    error(...args) {
      logger.error(args);
    },
  },
  // fetchAPI: {
  //   Request: NextRequest,
  //   Response: NextResponse,
  // },
  context: createContext,
  plugins: [
    // useLogger({
    //   logFn: (eventName, args) => {
    //     logger.debug({ eventName, args });
    //   },
    // }),
    useDataLoader(
      "companyLoader",
      ({ db }: GraphQLContext) =>
        new DataLoader(async (keys) => {
          const companies = await db.company.findMany({
            where: {
              id: {
                in: keys as [],
              },
            },
          });
          return keys.map((id) =>
            companies.find((company) => company.id === id)
          );
        })
    ),
    useResponseCache({
      cache,
      session: () => null,
      ttlPerSchemaCoordinate: {
        "Query.jobs": 1000 * 60 * 5,
      },
      // includeExtensionMetadata: false,
      // ttl: 1000 * 60 * 60 * 1,
    }),
  ],
});

/**
 * @param {number} port
 * @param {import('next/dist/server/next').RequestHandler} [handle]
 */
async function start(
  port: number,
  handle?: (
    req: IncomingMessage,
    res: ServerResponse,
    parsedUrl: UrlWithParsedQuery
  ) => Promise<void>,
  handleUpgrade?: (
    req: IncomingMessage,
    socket: any,
    head: any
  ) => Promise<void>
): Promise<() => Promise<void>> {
  // create http server
  const server = createServer(
    async (req: IncomingMessage, res: ServerResponse) => {
      try {
        // Be sure to pass `true` as the second argument to `url.parse`.
        // This tells it to parse the query portion of the URL.
        const url = parse(req.url!, true);

        if (url.pathname!.startsWith(graphqlEndpoint)) {
          await yoga(req, res);
        } else {
          if (!handle) {
            throw new Error(
              `Cannot handle ${url} since handler is not implemented`
            );
          }
          await handle(req, res, url);
        }
      } catch (err) {
        console.error(`Error while handling ${req.url}`, err);
        res.writeHead(500).end();
      }
    }
  );

  // create websocket server
  const wsServer = new WebSocketServer({ server, path: graphqlEndpoint });

  // prepare graphql-ws
  // eslint-disable-next-line
  useServer(
    {
      execute: (args: CustomerExecutionArgs) => args.rootValue?.execute?.(args),
      subscribe: (args: CustomerExecutionArgs) =>
        args.rootValue?.subscribe?.(args),
      onSubscribe: async (ctx, msg) => {
        const { schema, execute, subscribe, contextFactory, parse, validate } =
          yoga.getEnveloped({
            ...ctx,
            req: ctx.extra.request,
            socket: ctx.extra.socket,
            params: msg.payload,
          });

        const args = {
          schema,
          operationName: msg.payload.operationName,
          document: parse(msg.payload.query),
          variableValues: msg.payload.variables,
          contextValue: await contextFactory(),
          rootValue: {
            execute,
            subscribe,
          },
        };

        const errors = validate(args.schema, args.document);
        if (errors.length) return errors;
        return args;
      },
    },
    wsServer
  );

  await new Promise<void>((resolve, reject) => {
    server.on("upgrade", (req: IncomingMessage, socket, head) => {
      const url = parse(req.url!, true);

      if (!handleUpgrade) {
        throw new Error(`Cannot handle since handleUpgrade is not implemented`);
      }
      if (url.pathname!.startsWith(webpackEndpoint)) {
        handleUpgrade(req, socket, head);
      }
    });

    return server.listen(port, () => {
      resolve();
    });
  });

  return () =>
    new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve()))
    );
}

// dont start the next.js app when testing the server
if (process.env.NODE_ENV !== "test") {
  (async () => {
    try {
      await app.prepare();
      await start(port, app.getRequestHandler(), app.getUpgradeHandler());
      console.log(
        `App started!
HTTP server running on http://${hostname}:${port}
GraphQL WebSocket server running on ws://${hostname}:${port}${graphqlEndpoint}
`
      );
    } catch (error) {
      console.error(error);
    }
  })();
}

export { start };
