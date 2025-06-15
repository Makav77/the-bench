import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { UserModule } from '../Users/user.module';
import { ChatService } from './chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { ChatController } from './chat.controller';

@Module({
    providers: [ChatGateway, ChatService],
    imports: [UserModule, TypeOrmModule.forFeature([Message])],
    controllers: [ChatController],
    exports: [ChatService],
})
export class ChatModule {}
