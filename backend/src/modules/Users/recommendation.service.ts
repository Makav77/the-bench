import { Injectable, NotFoundException } from "@nestjs/common";
import { In, Not, Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { ChallengeRegistration } from "../Challenges/entities/challenge-registration.entity";
import { PollVote } from "../Polls/entities/poll-vote.entity";
import { Group } from "../chat/entities/group.entity";
import { Event } from "../Events/entities/event.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class RecommendationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(ChallengeRegistration)
    private readonly challengeRegRepo: Repository<ChallengeRegistration>,

    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,

    @InjectRepository(PollVote)
    private readonly pollVoteRepo: Repository<PollVote>,

    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>
  ) {}

  async getRecommendationsForUser(
    userId: string
  ): Promise<{ user: User; score: number }[]> {
    const weights = {
      friendOfFriend: 6,
      event: 5,
      challenge: 4,
      group: 3,
      poll: 2,
      survey: 1,
    };

    const scores = new Map<string, number>();

    const incr = (id: string, weight: number) => {
      if (id === userId) return;
      scores.set(id, (scores.get(id) || 0) + weight);
    };

    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ["friends", "friends.friends"],
    });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    for (const friend of user.friends) {
      for (const fof of friend.friends) {
        if (!user.friends.find((f) => f.id === fof.id)) {
          incr(fof.id, weights.friendOfFriend);
        }
      }
    }

    const challengeRegs = await this.challengeRegRepo.find({
      where: { user: { id: userId } },
      relations: [
        "challenge",
        "challenge.registrations",
        "challenge.registrations.user",
      ],
    });
    for (const reg of challengeRegs) {
      for (const other of reg.challenge.registrations) {
        incr(other.user.id, weights.challenge);
      }
    }

    const events = await this.eventRepo.find({
      where: { participantsList: { id: userId } },
      relations: ["participantsList"],
    });
    for (const event of events) {
      const participant = event.participantsList ?? [];
      for (const p of participant) {
        incr(p.id, weights.event);
      }
    }

    const votes = await this.pollVoteRepo.find({
      where: { voter: { id: userId } },
      relations: ["poll", "poll.votes", "poll.votes.voter"],
    });
    for (const vote of votes) {
      for (const other of vote.poll.votes) {
        incr(other.voter.id, weights.poll);
      }
    }

    const groups = await this.groupRepo.find({
      where: { members: { id: userId } },
      relations: ["members"],
    });
    for (const group of groups) {
      for (const member of group.members) {
        incr(member.id, weights.group);
      }
    }

    const userIds = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);
    const recommendedUsers = await this.userRepo.findBy({ id: In(userIds) });

    return recommendedUsers.map((user) => ({
      user,
      score: scores.get(user.id) || 0,
    }));
  }
}
