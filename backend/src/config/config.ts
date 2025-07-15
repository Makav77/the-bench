import dotenv from "dotenv";

dotenv.config();

export interface Configuration {
    dbName: string;
    dbPassword: string;
    dbUser: string;
    dbSynchronize: boolean;
    dbHost: string;
    dbPort: number;
    mongoUri: string;
}

const initConfig = (): Configuration => {
    const {
        DB_NAME,
        DB_PASSWORD,
        DB_USER,
        DB_SYNCHRONIZE,
        DB_HOST,
        DB_PORT,
        MONGO_URI
    } = process.env;

    if (!DB_NAME || !DB_PASSWORD || !DB_USER || !DB_SYNCHRONIZE || !DB_HOST || !MONGO_URI) {
        throw new Error("Missing environment variables. Please check your .env file.");
    }

    return {
        dbName: DB_NAME,
        dbPassword: DB_PASSWORD,
        dbUser: DB_USER,
        dbSynchronize: DB_SYNCHRONIZE.toLowerCase() === "true",
        dbHost: DB_HOST,
        dbPort: DB_PORT ? Number.parseInt(DB_PORT, 10) : 5432,
        mongoUri: MONGO_URI
    }
}

export const config: Readonly<Configuration> = initConfig();
