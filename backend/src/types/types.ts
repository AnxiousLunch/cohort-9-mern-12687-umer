import "express";
import type {JwtPayload} from "jsonwebtoken";

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: number;
                username: string;
            };
        }
    }
}

export interface AccessTokenPayload extends JwtPayload {
    userId: number;
    username: string;
}