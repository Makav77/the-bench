import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from '../../database/database-config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../Users/user.module';

@Module({
    imports: [
        TypeOrmModule.forRoot(databaseConfig),
        UserModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})

export class AppModule {}
