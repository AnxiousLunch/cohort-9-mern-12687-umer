import "express";
import type {JwtPayload} from "jsonwebtoken";

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                username: string;
            };
        }
    }
}

export interface AccessTokenPayload extends JwtPayload {
    userId: string;
    username: string;
}