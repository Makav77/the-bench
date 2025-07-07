import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './modules/App/app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from "cookie-parser";
import { join } from 'path';

import * as dotenv from 'dotenv';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: ["error", "warn", "log", "debug", "verbose"] });
    const port = 3000;

    app.use(cookieParser());

    dotenv.config();

    const origin = process.env.NODE_ENV === 'prod' ? process.env.FRONTEND_ORIGIN_PROD : process.env.FRONTEND_ORIGIN_DEV;

    app.enableCors({
        origin: origin,
        credentials: true,
    });

    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));

    app.useStaticAssets(join(__dirname, "..", "uploads"), {
        prefix: "/uploads/",
    });

    await app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
}

bootstrap();
