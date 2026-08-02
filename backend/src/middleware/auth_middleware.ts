// Beginning point for auth middleware
// used as a sort of interceptor

// for each request verify the cookie
// valid -> pass
// expired -> deny


import type { NextFunction, Request, Response } from "express";
import logger from "../services/logger.js";

export default async function authenticate(req: Request, res: Response, next: NextFunction) {
    try {
        const auth = req.headers.authorization;
        const token = auth?.startsWith("Bearer ") ? auth.split(" ")[1] : undefined;
        
        if (!token) {
            logger.error("No token found");
            return;
        }
        
        // verify token logic here

    } catch(err) {
        next(err);
    }
}