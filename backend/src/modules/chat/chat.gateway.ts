import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway({cors: {origin: '*'}})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @SubscribeMessage('newMessage')
    handleNewMessage(client: Socket, message: any) {
        console.log('New message received:', message);

        client.emit('reply', 'this is a reply from the server');
    }

    handleConnection(client: Socket) {
        console.log('Client connected:', client.id);
    }
    handleDisconnect(client: Socket) {
        console.log('Client disconnected:', client.id);
    }
}