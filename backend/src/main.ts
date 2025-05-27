import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './modules/App/app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from "cookie-parser";
import { join } from 'path';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: ["error", "warn", "log", "debug", "verbose"] });
    const port = 3000;
    console.log("✅ API Google Places key:", process.env.GOOGLE_PLACES_API_KEY ? "SET" : "MISSING");


    app.use(cookieParser());

    app.enableCors({
        origin: 'http://localhost:5173',
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
