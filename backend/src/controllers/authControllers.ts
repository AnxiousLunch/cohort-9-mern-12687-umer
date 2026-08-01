// Containing route logic for authentication
import prisma from "../../prisma/adapter.js"
import type { NextFunction, Response, Request } from "express";
import logger from "../services/logger.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { success } from "zod";


const user_tokens = (user_id: String, username: String) => {
    const access_token = jwt.sign(
        {user_id, username}, "ACCESS_SECRET", {expiresIn: "1d"}
    );
    const refresh_token = jwt.sign(
        {user_id, username}, "REFRESH_TOKEN", {expiresIn: "7d"}
    );

    return {access_token, refresh_token}
}

export async function register(req: Request, res: Response, next: NextFunction) {
    const {username, email, password} = req.body();

    const isExisting = await prisma.user.findFirst({
        where: {OR: [{username}, {email}]}
    });

    if (isExisting) {
        logger.error("User already exists");
        res.status(409).json({
            "msg": "User already exists!"
        });
        return;
    }


    const user = await prisma.user.create({
        data: {
            username, email, 
            passwordHash: await bcrypt.hash(password, 10)
        }
    });

    const {access_token, refresh_token} = user_tokens(user.id.toString(), user.username);

    return res.status(201).json({
        success: true,
        msg: "User registered successfully",
        access_token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email
        }
    });

}

export async function login(req: Request, res: Response, next: NextFunction) {
    const {identifier, password} = req.body;

    const user = await prisma.user.findFirst({
        where: {OR: [{email: identifier}, {username: identifier}]}
    });

    if (!user) {
        logger.info("User does not exist");
        res.status(404).json({
            msg: "User does not exist!"
        });
        return;
    }

    logger.info("User found, can log in");

    const {access_token, refresh_token} = user_tokens(user.id.toString(), user.username);
    return res.status(201).json({
        msg: "Logged in successfully",
        access_token,
        user: {
            user_id: user.id,
            username: user.username,
            email: user.email
        }
    });

}

export async function logout(req: Request, res: Response, next: NextFunction) {

}