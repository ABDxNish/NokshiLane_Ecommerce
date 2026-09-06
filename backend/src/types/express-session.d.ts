import 'express-session';

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: string;
      name: string;
      email: string;
      phone: string | null;
      role: string;
    };
  }
}
