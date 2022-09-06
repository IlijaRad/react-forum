import { MikroORM, RequestContext } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import config from "./mikro-orm.config";
import express from "express";

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

    const post = orm.em.create(Post, { title: "my first post" });
    await orm.em.persistAndFlush(post);
  });

  app.listen("4000", () => {
    console.log("server started on localhost:4000");
  });
};

main();
