import "reflect-metadata";
import { MikroORM, RequestContext } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import config from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { PostResolver } from "./resolvers/post";

const main = async () => {
  const orm = await MikroORM.init(config);
  const app = express();
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
      resolvers: [PostResolver],
      validate: false,
    }),
    context: () => ({ em: orm.em }),
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app });

  app.listen("4000", () => {
    console.log("server started on localhost:4000");
  });
};

main();
