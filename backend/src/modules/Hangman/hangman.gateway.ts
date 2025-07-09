import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/hangman', cors: { origin: '*' } })
export class HangmanGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private clients: Map<string, string> = new Map();

    handleConnection(client: Socket) {
        console.log(`[Hangman] Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`[Hangman] Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('auth')
    handleAuth(
        @MessageBody() data: { userId: string },
        @ConnectedSocket() client: Socket
    ) {
        this.clients.set(client.id, data.userId);
        client.join(`user-${data.userId}`);
        console.log(`[Hangman] Mapped socket ${client.id} to user ${data.userId}`);
    }

    @SubscribeMessage('hangman:wordSubmitted')
    handleHangmanWordSubmitted(
        @MessageBody() data: { inviteId: string; word: string },
        @ConnectedSocket() client: Socket
    ) {
        const room = `hangman-${data.inviteId}`;
        client.to(room).emit('hangman:wordSubmitted', { word: data.word });
    }

    @SubscribeMessage('hangman:letterGuessed')
    handleHangmanLetterGuessed(
        @MessageBody() data: { inviteId: string; letter: string; incorrectGuesses: number },
        @ConnectedSocket() client: Socket
    ) {
        const room = `hangman-${data.inviteId}`;
        this.server.to(room).emit('hangman:letterGuessed', {
            letter: data.letter,
            incorrectGuesses: data.incorrectGuesses,
        });

        console.log(`[Hangman] Letter guessed in ${room}: ${data.letter}, incorrect: ${data.incorrectGuesses}`);
    }

    @SubscribeMessage('hangman:replayRequested')
    handleReplayRequest(
        @MessageBody() data: { inviteId: string }
    ) {
        const { inviteId } = data;
        this.server.to(`hangman-${inviteId}`).emit('hangman:replayStarted');
        console.log(`[Hangman] Replay started for hangman-${inviteId}`);
    }

    @SubscribeMessage('hangman:leaveGame')
    handleLeaveGame(@MessageBody() data: { inviteId: string }) {
        const { inviteId } = data;
        this.server.to(`hangman-${inviteId}`).emit('hangman:opponentLeft');
        console.log(`[Hangman] Opponent left hangman-${inviteId}`);
    }

    @SubscribeMessage('hangman:join')
    handleJoinRoom(@MessageBody() room: string, @ConnectedSocket() client: Socket) {
        client.join(room);
        console.log(`[Hangman] Client ${client.id} joined room ${room}`);
    }
}
