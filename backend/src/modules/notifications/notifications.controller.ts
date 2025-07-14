import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get(":userId")
  getUserNotifications(@Param("userId") userId: string) {
    return this.service.findByUser(userId);
  }

  @Post()
  createNotification(
    @Body() dto: { userId: string; title: string; message: string }
  ) {
    return this.service.create(dto.userId, dto.title, dto.message);
  }

  @Put("read/all/:userId")
  markAllAsRead(@Param("userId") userId: string) {
    return this.service.markAllAsRead(userId);
  }

  @Delete(":id")
  async deleteNotification(@Param("id") id: string) {
    return this.service.delete(id);
  }

  @Put(":id/read")
  async updateReadStatus(@Param("id") id: string, @Body("read") read: boolean) {
    return this.service.updateReadStatus(id, read);
  }
}
