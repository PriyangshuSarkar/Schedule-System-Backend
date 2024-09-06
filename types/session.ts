export interface CreateSessionRequest {
  start: Date;
  end: Date;
  duration: number;
  scheduledSlots: [];
}

export interface SessionIdRequest {
  sessionId?: string;
}

export interface ConfirmSessionRequest {
  attendees: {
    name: string;
    email: string;
  };
}

export interface RescheduleSessionRequest {
  start: Date;
  end: Date;
  attendees: {
    name: string;
    email: string;
  };
}
