import { Controller, Post, Body, Param, Get, UseGuards, Request, Patch } from '@nestjs/common';
import { HangmanInviteService } from './hangman-invite.service';
import { JwtAuthGuard } from '../Auth/guards/jwt-auth.guard';

@Controller('hangman/invite')
@UseGuards(JwtAuthGuard)
export class HangmanInviteController {
    constructor(private readonly inviteService: HangmanInviteService) { }

    @Post('send/:recipientId')
    sendInvite(@Request() req, @Param('recipientId') recipientId: string) {
        return this.inviteService.sendInvite(req.user, recipientId);
    }

    @Get('pending')
    getMyPendingInvites(@Request() req) {
        return this.inviteService.getPendingInvitesForUser(req.user.id);
    }

    @Post(':inviteId/:action')
    respondToInvite(
        @Param('inviteId') inviteId: string,
        @Param('action') action: 'accepted' | 'declined',
    ) {
        return this.inviteService.respondToInvite(inviteId, action);
    }

    @Get(':inviteId')
    getInvite(@Param('inviteId') inviteId: string) {
        return this.inviteService.findById(inviteId);
    }

    @Patch(':id/word')
    async setWord(
        @Param('id') id: string,
        @Body('word') word: string,
    ) {
        return this.inviteService.setWord(id, word);
    }
}
