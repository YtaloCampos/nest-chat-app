import { 
  OnGatewayInit, 
  OnGatewayConnection, 
  OnGatewayDisconnect, 
  SubscribeMessage, 
  WebSocketGateway, 
  WebSocketServer 
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({ namespace: '/chat' })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server;
  
  private logger: Logger = new Logger('ChatGateway');

  afterInit(server: Server) {
    this.logger.log('Initialized!');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected:    ${client.id}`);
  }

  @SubscribeMessage('sendNewMessage')
  handleMessage(client: Socket, payload: { payload: object }) {
    this.wss.emit('newReceivedMessage', payload);
  }
} 
