import "express";
import type {JwtPayload} from "jsonwebtoken";

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: Number;
                username: string;
            };
        }
    }
}

export interface AccessTokenPayload extends JwtPayload {
    userId: Number;
    username: string;
}