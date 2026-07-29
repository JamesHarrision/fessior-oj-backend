import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../utils/jwt.util';
declare global {
    namespace Express {
        interface Request {
            user: JwtPayload & {
                username?: string;
                email?: string;
            };
        }
    }
}
export declare const requireAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const requireAdmin: (req: Request, res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
