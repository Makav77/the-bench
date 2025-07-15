import { config } from "../config/config";

const mongoUri = config.mongoUri ?? "";
if (!mongoUri) {
    throw new Error("Missing MONGO_URI for MongoDB configuration.");
}

export const MONGO_URI: string = mongoUri;
