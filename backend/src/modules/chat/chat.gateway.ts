import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { UserService } from "../Users/user.service";
import { ChatService } from './chat.service';

@WebSocketGateway({cors: {origin: '*'}})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private clients: Map<string, string> = new Map();
    constructor(
        private readonly userService: UserService,
        private readonly chatService: ChatService,
    ){}

    @SubscribeMessage('auth')
    handleAuth(
        @MessageBody() data: { userId: string },
        @ConnectedSocket() client: Socket
    ) {
        this.clients.set(client.id, data.userId);
        console.log(`Mapped socket ${client.id} to user ${data.userId}`);
        console.log('Current clients:', Array.from(this.clients.entries()));
    }

    @SubscribeMessage('newMessage')
    handleNewMessage(client: Socket, message: any) {
        console.log('New message received:', message);

        client.emit('reply', 'this is a reply from the server');
    }

    handleConnection(client: Socket) {
        console.log('Client connected:', client.id);
    }
    handleDisconnect(client: Socket) {
        this.clients.delete(client.id);
        console.log('Client disconnected:', client.id);
    }
    
    @SubscribeMessage('message')
    async handleMessage(
        @MessageBody() data: { room: string; content: string; userId: string; username?: string },
        @ConnectedSocket() client: Socket,
    ) {
        const user = await this.userService.findOne(data.userId);
        if (!user) {
            console.error(`User with ID ${data.userId} not found.`);
            return;
        }
        const type = data.room === 'general'
            ? 'general'
            : data.room.startsWith('group') ? 'group' : 'private';
        
        let normalizedRoom = data.room;
        if (type === 'private') {
            const ids = data.room.replace('private-', '').split('_').sort();
            normalizedRoom = `private-${ids.join('_')}`;
        }

        await this.chatService.saveMessage({
            content: data.content,
            room: normalizedRoom,
            type: type,
            sender: user,
        });
        
        const payload = {
            content: data.content,
            userId: data.userId,
            username: data.username || `${user.lastname} ${user.firstname}`,
        };
        
        if (data.room === 'general') {
            this.server.to(data.room).emit('general-message', payload);
        } else if(data.room.startsWith('group')){
            const groupId = data.room.split("group-")[1];
            this.server.to(data.room).emit(`group-message-${groupId}`, payload);
        } else {
            this.server.to(data.room).emit(`private-message-${data.room}`, payload);
        }
    }

    @SubscribeMessage('join')
    handleJoinRoom(@MessageBody() room: string, @ConnectedSocket() client: Socket) {
        client.join(room);
        console.log(`Client ${client.id} joined room ${room}`);
    }
}