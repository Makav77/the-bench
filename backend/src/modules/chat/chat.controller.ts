import { Controller, Get, Param, UseGuards, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../Auth/guards/jwt-auth.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Get('messages/:room')
  async getMessages(@Param('room') room: string) {
    return this.chatService.getMessages(room);
  }

  @UseGuards(JwtAuthGuard)
  @Post('groups')
  createGroup(@Body() body: { name: string; members: string[] }) {
    return this.chatService.createGroup(body.name, body.members);
  }

  @UseGuards(JwtAuthGuard)
  @Get('groups/:userId')
  getUserGroups(@Param('userId') userId: string) {
    return this.chatService.getGroupsForUser(userId);
  }
}