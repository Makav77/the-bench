import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Message } from "./entities/message.entity";
import { User } from "../Users/entities/user.entity";
import { Group } from './entities/group.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async saveMessage(data: {
    content: string;
    room: string;
    type: "general" | "private" | "group";
    sender: User;
  }) {
    const msg = this.messageRepo.create(data);
    return this.messageRepo.save(msg);
  }

  async getMessages(room: string) {
    return this.messageRepo.find({
      where: { room },
      order: { createdAt: "ASC" },
      relations: ["sender"],
    });
  }

  async createGroup(name: string, memberIds: string[]) {
    const members = await this.userRepo.findByIds(memberIds);
    const group = this.groupRepo.create({ name, members });
    return this.groupRepo.save(group);
  }

  async getGroupsForUser(userId: string) {
    return this.groupRepo
      .createQueryBuilder("group")
      .leftJoinAndSelect("group.members", "member")
      .where("member.id = :userId", { userId })
      .getMany();
  }
}
