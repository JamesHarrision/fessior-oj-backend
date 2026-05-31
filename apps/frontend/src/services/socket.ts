import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const socketService = {
  connect: (token: string) => {
    if (socket) return socket;
    
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:6868';
    socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Socket connected successfully with ID:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return socket;
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  getSocket: () => socket,

  // Matchmaking Emitters
  joinQueue: () => {
    socket?.emit('join-queue');
  },

  leaveQueue: () => {
    socket?.emit('leave-queue');
  },

  forfeitMatch: (matchId: string) => {
    socket?.emit('forfeit-match', { matchId });
  },

  // Custom Room Emitters
  joinCustomRoom: (roomCode: string) => {
    socket?.emit('join-custom-room', { roomCode });
  },

  leaveCustomRoom: (roomCode: string) => {
    socket?.emit('leave-custom-room', { roomCode });
  },

  // Listeners
  onQueueStatus: (callback: (data: { status: 'QUEUED' | 'IDLE' | 'MATCHED'; elo?: number; message?: string }) => void) => {
    socket?.off('queue-status');
    socket?.on('queue-status', callback);
  },

  onMatchFound: (callback: (data: {
    matchId: string;
    problem: {
      id: string;
      title: string;
      slug: string;
      description: string;
      difficulty: string;
      timeLimit: number;
      memoryLimit: number;
      starterCodes?: any;
    };
    player1: { userId: string; username: string; elo: number };
    player2: { userId: string; username: string; elo: number };
  }) => void) => {
    socket?.off('match-found');
    socket?.on('match-found', callback);
  },

  onRivalSubmission: (callback: (data: {
    userId: string;
    status: string;
    testCasesPassed: number;
    testCasesTotal: number;
  }) => void) => {
    socket?.off('rival-submission');
    socket?.on('rival-submission', callback);
  },

  onMatchEnded: (callback: (data: {
    winnerId: string;
    loserId: string;
    eloUpdates: {
      [userId: string]: { elo: number; change: number; streak: number };
    };
  }) => void) => {
    socket?.off('match-ended');
    socket?.on('match-ended', callback);
  },

  // Custom Room Listeners
  onMatchStarted: (callback: (data: { matchId: string; roomId: string; problemId: string }) => void) => {
    socket?.off('match-started');
    socket?.on('match-started', callback);
  },

  onPlayerLeft: (callback: (data: { userId: string }) => void) => {
    socket?.off('player-left');
    socket?.on('player-left', callback);
  },

  onConfigUpdated: (callback: (data: any) => void) => {
    socket?.off('config-updated');
    socket?.on('config-updated', callback);
  },

  onRoomDeleted: (callback: () => void) => {
    socket?.off('room-deleted');
    socket?.on('room-deleted', callback);
  },
};
