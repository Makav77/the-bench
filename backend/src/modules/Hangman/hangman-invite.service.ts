import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HangmanInvite } from './entities/invite.entity';
import { LessThan, Repository } from 'typeorm';
import { User } from '../Users/entities/user.entity';
import { ChatGateway } from '../chat/chat.gateway';

@Injectable()
export class HangmanInviteService {
    constructor(
        @InjectRepository(HangmanInvite)
        private inviteRepo: Repository<HangmanInvite>,
        private readonly chatGateway: ChatGateway,
    ) { }

    async sendInvite(sender: User, recipientId: string): Promise<HangmanInvite> {
        const invite = this.inviteRepo.create({
            sender,
            recipient: { id: recipientId } as User,
            status: 'pending',
        });
        return this.inviteRepo.save(invite);
    }

    async getPendingInvitesForUser(userId: string): Promise<HangmanInvite[]> {
        return this.inviteRepo.find({
            where: { recipient: { id: userId }, status: 'pending' },
            order: { createdAt: 'DESC' },
        });
    }

    async respondToInvite(inviteId: string, action: 'accepted' | 'declined') {
        const invite = await this.inviteRepo.findOne({ where: { id: inviteId }, relations: ['sender', 'recipient'] });
        if (!invite) throw new NotFoundException('Invite not found.');

        if (action === 'declined') {
            invite.status = 'declined';
            await this.inviteRepo.save(invite);
            return { status: 'declined' };
        }

        if (action === 'accepted') {
            invite.status = 'accepted';
            await this.inviteRepo.save(invite);

            const [giverId, guesserId] = Math.random() > 0.5
                ? [invite.sender.id, invite.recipient.id]
                : [invite.recipient.id, invite.sender.id];

            this.chatGateway.server.to(`user-${invite.sender.id}`).emit('hangman:gameStarted', {
                inviteId: invite.id,
                role: invite.sender.id === giverId ? 'giver' : 'guesser',
            });
            this.chatGateway.server.to(`user-${invite.recipient.id}`).emit('hangman:gameStarted', {
                inviteId: invite.id,
                role: invite.recipient.id === giverId ? 'giver' : 'guesser',
            });

            return {
                status: 'game_started',
                inviteId: invite.id,
                role: 'guesser',
            };
        }
    }

    async deleteExpiredInvites(): Promise<number> {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        const result = await this.inviteRepo.delete({
            status: 'pending',
            createdAt: LessThan(fiveMinutesAgo),
        });

        return result.affected || 0;
    }

    async findById(inviteId: string) {
        return this.inviteRepo.findOne({
            where: { id: inviteId },
            relations: ['sender', 'recipient']
        });
    }

    async setWord(id: string, word: string) {
        const invite = await this.inviteRepo.findOne({ where: { id } });
        if (!invite) {
            throw new NotFoundException("Invite not found");
        }

        invite.wordToGuess = word;
        return this.inviteRepo.save(invite);
    }
}
