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
import cors from "cors";

const main = async () => {
  const orm = await MikroORM.init(config);
  const app = express();

  let RedisStore = require("connect-redis")(session);
  let redisClient = createClient({ legacyMode: true });
  redisClient.connect().catch(console.error);

  app.use((req, res, next) => {
    res.append("Access-Control-Allow-Origin", ["http://localhost:3000"]);
    res.append("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.append("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Expose-Headers", "Access-Control-Allow-Origin");
    next();
  });

  app.use(function (req, res, next) {
    res.on("finish", () => {
      console.log(`request url = ${req.originalUrl}`);
      console.log(res.getHeaders());
    });
    next();
  });

  // app.use(cors({ origin: "http://localhost:3000", credentials: true }));

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
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }: MyContext) => ({ em: orm.em, req, res }),
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen("4000", () => {
    console.log("server started on localhost:4000");
  });
};

main();
