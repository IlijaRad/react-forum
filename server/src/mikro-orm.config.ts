import { Options } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import path from "path";
import { User } from "./entities/User";

const config: Options = {
  entities: [Post, User],
  dbName: "react-forum",
  user: "postgres",
  password: "root",
  debug: !__prod__,
  type: "postgresql",
  migrations: {
    path: path.join(__dirname, "./migrations"),
    glob: "!(*.d).{js,ts}",
  },
};

export default config;
