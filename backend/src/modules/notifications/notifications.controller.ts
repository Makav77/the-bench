import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get(':userId')
  getUserNotifications(@Param('userId') userId: string) {
    return this.service.findByUser(userId);
  }

  @Post()
  createNotification(@Body() dto: { userId: string, title: string, message: string }) {
    return this.service.create(dto.userId, dto.title, dto.message);
  }

  @Put(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.service.markAsRead(id);
  }
}
