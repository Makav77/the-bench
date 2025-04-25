import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/App/app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { logger: ["error", "warn", "log", "debug", "verbose"] });
    const port = 3000;

    await app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
}

bootstrap();
