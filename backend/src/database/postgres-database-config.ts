import type { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { config } from "../config/config";

export const postgresDatabaseConfig: TypeOrmModuleOptions = {
    type: "postgres",
    host: config.dbHost,
    port: config.dbPort,
    username: config.dbUser,
    password: config.dbPassword,
    database: config.dbName,
    logging: true,
    synchronize: config.dbSynchronize,
    entities: [`${__dirname}/../**/*.entity{.ts,.js}`]
};
