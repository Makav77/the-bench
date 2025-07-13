import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class NotificationsService {
  constructor(@InjectModel('Notification') private notifModel: Model<Notification>) {}

  async findByUser(userId: string) {
    return this.notifModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async create(userId: string, title: string, message: string) {
    const notif = new this.notifModel({ userId, title, message });
    return notif.save();
  }

  async markAsRead(id: string) {
    return this.notifModel.findByIdAndUpdate(id, { read: true }, { new: true });
  }
}