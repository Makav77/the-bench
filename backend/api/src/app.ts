import express, { type Request, type Response } from 'express';
import { initHandlers } from './handlers/handler';
import { AppDataSource } from './db/database';

const app = async () => {
    const app = express();
    const port = 3010;

    app.use(express.json());
    initHandlers(app);

    try {
        console.log("Connecting to the database ...");
        await AppDataSource.initialize();
        console.log("Database connected successfully !");

        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
        }
    }
}

app();