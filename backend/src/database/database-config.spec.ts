describe('Database Config', () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...OLD_ENV };
        process.env.DB_NAME = 'db';
        process.env.DB_PASSWORD = 'password';
        process.env.DB_USER = 'admin';
        process.env.DB_SYNCHRONIZE = 'true';
        process.env.DB_HOST = process.env.NODE_ENV === 'prod' ? '209.38.138.250' : 'localhost';
        process.env.DB_PORT = '5432';
    });

    afterEach(() => {
        process.env = OLD_ENV;
    });

    it('should return valid TypeOrmModuleOptions', async () => {
        const expected = {
            type: 'postgres',
            host: process.env.NODE_ENV === 'prod' ? '209.38.138.250' : 'localhost',
            port: 5432,
            username: 'admin',
            password: 'password',
            database: 'db',
            logging: true,
            synchronize: true,
            entities: [expect.stringContaining('/**/*.entity')],
        };
        
        const { postgresDatabaseConfig } = await import('./postgres-database-config');
        expect(postgresDatabaseConfig).toMatchObject(expected);
    });
});
