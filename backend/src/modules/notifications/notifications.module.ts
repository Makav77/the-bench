import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationSchema } from './schemas/notification.schema';
import { PermissionsModule } from '../Permissions/permissions.module';

@Module({
  providers: [NotificationsService],
  controllers: [NotificationsController],
  imports: [
          MongooseModule.forFeature([
              { name: "notification", schema: NotificationSchema }
          ]),
          PermissionsModule,
      ],
})
export class NotificationsModule {}
