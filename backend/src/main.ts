import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/App/app.module';
import cookieParser from "cookie-parser";

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { logger: ["error", "warn", "log", "debug", "verbose"] });
    const port = 3000;

    app.use(cookieParser());

    app.enableCors({
        origin: 'http://localhost:5173',
        credentials: true,
    });

    await app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
}

bootstrap();
