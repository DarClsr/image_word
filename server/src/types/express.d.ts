import { User, AdminUser } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      admin?: AdminUser;
    }
  }
}

export {};
