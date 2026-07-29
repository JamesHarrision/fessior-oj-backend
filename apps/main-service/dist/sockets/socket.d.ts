import { Server } from 'socket.io';
export declare let io: Server | null;
export declare const initSocket: (socketIoServer: Server) => void;
