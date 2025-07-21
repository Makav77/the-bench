import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./modules/App/app.module";
import { ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";
import { join } from 'path';
import * as swaggerUi from 'swagger-ui-express';
import * as fs from 'fs';
import * as dotenv from "dotenv";

dotenv.config();

const allowedOrigins = [
  "http://localhost",
  "https://the-bench.app",
  "https://www.the-bench.app",
];

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === "prod";
  const port = 3000;

  let app: NestExpressApplication;

  if (isProduction) {
    const httpsOptions = {
      key: fs.readFileSync("/etc/letsencrypt/live/the-bench.app/privkey.pem"),
      cert: fs.readFileSync("/etc/letsencrypt/live/the-bench.app/fullchain.pem"),
    };

    app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: ["error", "warn", "log", "debug", "verbose"],
      httpsOptions,
    });
  } else {
    app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: ["error", "warn", "log", "debug", "verbose"],
    });
  }

  app.use(cookieParser());

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  app.useStaticAssets(join(__dirname, "..", "uploads"), {
    prefix: "/uploads/",
  });

    const swaggerPath = join(__dirname, 'docs', 'openapi.json');
    if (fs.existsSync(swaggerPath)) {
        const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
        console.log("API docs available at /api-docs");
    } else {
        console.warn("Swagger docs not found. Did you run npm run build:docs?");
    }
  
  await app.listen(port, () => {
    console.log(
      `Server running on ${isProduction ? "https" : "http"}://localhost:${port}`
    );
  });
}

bootstrap();