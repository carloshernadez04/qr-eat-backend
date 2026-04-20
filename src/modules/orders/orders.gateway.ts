import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Order } from './entities/order.entity';

@WebSocketGateway({ cors: { origin: '*' } })
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer()
  server: Server; 
  handleConnection(client: Socket) {
    console.log(`Pantalla conectada al WebSocket: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Pantalla desconectada: ${client.id}`);
  }

  notifyNewOrder(order: Order) {
    this.server.emit('newOrder', order); 
  }

  notifyOrderStatusUpdate(order: Order) {
    this.server.emit('orderStatusUpdated', order);
  }
}