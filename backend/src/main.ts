import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './modules/App/app.module';
import cookieParser from "cookie-parser";
import { join } from 'path';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: ["error", "warn", "log", "debug", "verbose"] });
    const port = 3000;

    app.use(cookieParser());

    app.enableCors({
        origin: 'http://localhost:5173',
        credentials: true,
    });

    app.useStaticAssets(join(__dirname, "..", "uploads"), {
        prefix: "/uploads",
    });

    await app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
}

bootstrap();
