import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { UserModule } from '../Users/user.module';
import { ChatService } from './chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { ChatController } from './chat.controller';
import { Group } from './entities/group.entity';
import { User } from '../Users/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    providers: [ChatGateway, ChatService],
    imports: [UserModule, NotificationsModule, TypeOrmModule.forFeature([Message, Group, User])],
    controllers: [ChatController],
    exports: [ChatService],
})
export class ChatModule {}
