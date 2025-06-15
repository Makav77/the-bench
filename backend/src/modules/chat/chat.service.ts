import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Message } from "./entities/message.entity";
import { User } from "../Users/entities/user.entity";

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}

  async saveMessage(data: {
    content: string;
    room: string;
    type: 'general' | 'private' | 'group';
    sender: User;
  }) {
    const msg = this.messageRepo.create(data);
    return this.messageRepo.save(msg);
  }

  async getMessages(room: string) {
    return this.messageRepo.find({
      where: { room },
      order: { createdAt: 'ASC' },
      relations: ['sender'],
    });
  }
}
