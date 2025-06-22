import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
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
    if (members.length !== memberIds.length) {
      throw new NotFoundException("Some users do not exist");
    }
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


  async leaveGroup(groupId: string, user: User): Promise<{ deleted: boolean }> {
    const group = await this.groupRepo.findOne({
      where: { id: groupId },
      relations: ['members'],
    });

    if (!group) throw new NotFoundException('Group not found');

    if (!group.members.some(m => m.id === user.id)) {
      throw new BadRequestException("You are not part of this group");
    }

    group.members = group.members.filter(m => m.id !== user.id);

    if (group.members.length === 0) {
      await this.groupRepo.remove(group);
      return { deleted: true };
    }

    await this.groupRepo.save(group);
    return { deleted: false };
  }
}
