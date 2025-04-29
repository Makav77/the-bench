jest.mock("dotenv", () => ({ config: jest.fn() }));

describe("Config", () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...OLD_ENV };
    });

    afterAll(() => {
        process.env = OLD_ENV;
    });

    test("should initialize config correctly when all env vars are present", () => {
        process.env.DB_NAME = "db";
        process.env.DB_PASSWORD = "password";
        process.env.DB_USER = "admin";
        process.env.DB_SYNCHRONIZE = "true";
        process.env.DB_HOST = "localhost";
        process.env.DB_PORT = "5432";

        const { config } = require("./config");
        expect(config).toEqual({
            dbName: "db",
            dbPassword: "password",
            dbUser: "admin",
            dbSynchronize: true,
            dbHost: "localhost",
            dbPort: 5432
        });
    });

    test("should throw an error if a required env var is missing", () => {
        delete process.env.DB_NAME;

        expect(() => {
            require("./config");
        }).toThrow("Missing environment variables. Please check your .env file.");
    });

    test("should fallback to default port 5432 if DB_PORT is not defined", () => {
        process.env.DB_NAME = "mydb";
        process.env.DB_PASSWORD = "mypassword";
        process.env.DB_USER = "myuser";
        process.env.DB_SYNCHRONIZE = "true";
        process.env.DB_HOST = "localhost";
        delete process.env.DB_PORT;

        const { config } = require("./config");
        expect(config.dbPort).toBe(5432);
    });
});
