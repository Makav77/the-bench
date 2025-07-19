import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { JwtAuthGuard } from "../Auth/guards/jwt-auth.guard";


@Controller("notifications")
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get(":userId")
  getUserNotifications(@Param("userId") userId: string) {
    return this.service.findByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createNotification(
    @Body() dto: { userId: string; title: string; message: string }
  ) {
    return this.service.create(dto.userId, dto.title, dto.message);
  }

  @UseGuards(JwtAuthGuard)
  @Put("read/all/:userId")
  markAllAsRead(@Param("userId") userId: string) {
    return this.service.markAllAsRead(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  async deleteNotification(@Param("id") id: string) {
    return this.service.delete(id);
  }
  
  @UseGuards(JwtAuthGuard)
  @Put(":id/read")
  async updateReadStatus(@Param("id") id: string, @Body("read") read: boolean) {
    return this.service.updateReadStatus(id, read);
  }
}
