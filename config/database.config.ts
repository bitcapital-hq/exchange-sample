import { EntityDatabaseOptions } from "ts-framework-sql";
import { ConnectionOptions } from "typeorm";

export default {
  type: "postgres",
  logging: ["error"],
  synchronize: false,
  host: process.env.DATABASE_HOST || "localhost",
  port: process.env.DATABASE_PORT || "5432",
  username: process.env.DATABASE_USER || "postgres",
  password: process.env.DATABASE_PASSWORD || "postgres",
  database: process.env.DATABASE_NAME || "postgres",

  // IMPORTANT: Path should be relative to root
  entities: ["./api/models/**/*.ts"],
  migrations: ["./api/migrations/**/*.ts"],

  cli: {
    // IMPORTANT: Path should be relative to root
    entitiesDir: "./api/models",
    migrationsDir: "./api/migrations"
  }
} as any;