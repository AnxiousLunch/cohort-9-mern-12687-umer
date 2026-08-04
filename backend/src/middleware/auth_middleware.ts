// Beginning point for auth middleware
// used as a sort of interceptor

// for each request verify the cookie
// valid -> pass
// expired -> deny

import type { NextFunction, Request, Response } from "express";
import logger from "../services/logger.js";
import { AppError } from "./error_middleware.js";
import jwt from "jsonwebtoken";
import type { AccessTokenPayload } from "../types/types.js";
import { ACCESS_SECRET } from "../controllers/authControllers.js";


export function verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(
        token,
        ACCESS_SECRET
    ) as AccessTokenPayload;
}

export default async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const auth = req.headers.authorization;
        const token = auth?.startsWith("Bearer ") ? auth.split(" ")[1] : undefined;
        
        if (!token) {
            throw new AppError(401, "Authentication Required!");
        }
        
        // verify token logic here
        req.user = verifyAccessToken(token);
        next();
    } catch(err) {
        next(err);
    }
}