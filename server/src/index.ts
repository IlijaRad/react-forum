import "reflect-metadata";
import { MikroORM, RequestContext } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import config from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import session from "express-session";
import { createClient } from "redis";
import { MyContext } from "./types";
import { ApolloServerPluginLandingPageLocalDefault } from "apollo-server-core";

const main = async () => {
  const orm = await MikroORM.init(config);
  const app = express();

  let RedisStore = require("connect-redis")(session);
  let redisClient = createClient({ legacyMode: true });
  redisClient.connect().catch(console.error);

  app.use(
    session({
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 yrs
        httpOnly: true,
        sameSite: "lax", //csrf
        secure: __prod__, //cookie only works in https
      },
      saveUninitialized: false,
      resave: false,
      name: "qid",
      secret: "qetteqteqtqetqetqetqeteqtqt",
    })
  );

  app.use((_req, _res, next) => {
    RequestContext.create(orm.em, next);
  });

  await RequestContext.createAsync(orm.em, async () => {
    await orm.getMigrator().up();
    const generator = orm.getSchemaGenerator();
    await generator.updateSchema();
  });

  const apolloServer = new ApolloServer({
    csrfPrevention: true,
    plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }: MyContext) => ({ em: orm.em, req, res }),
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app });

  app.listen("4000", () => {
    console.log("server started on localhost:4000");
  });
};

main();
