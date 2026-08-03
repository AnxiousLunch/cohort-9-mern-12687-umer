// Containing route logic for authentication
import prisma from "../../prisma/adapter.js"
import type { NextFunction, Response, Request } from "express";
import logger from "../services/logger.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Prisma } from "../../prisma/generated/prisma/client.js";
import crypto from "node:crypto"
import { z } from "zod";


function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        logger.error(`Missing required environment variable: ${name}`);
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

const ACCESS_SECRET = requireEnv("ACCESS_SECRET");
const REFRESH_SECRET = requireEnv("REFRESH_SECRET");


const user_tokens = async (user_id: number, username: string) => {
    const access_token = jwt.sign(
        { user_id, username }, ACCESS_SECRET, { expiresIn: "1d" }
    );
    const refresh_token = jwt.sign(
        { user_id, username }, REFRESH_SECRET, { expiresIn: "7d" }
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const token_hash = crypto.createHash("sha256").update(refresh_token).digest("hex");

    await prisma.refreshToken.create({
        data: {
            userId: user_id,
            tokenHash: token_hash,
            expiresAt
        }
    })

    return { access_token, refresh_token }
}
export async function register(req: Request, res: Response, next: NextFunction) {
    try {
        const { username, email, password } = req.body;

        const isExisting = await prisma.user.findFirst({
            where: {
                OR: [{ username }, { email }],
            },
        });

        if (isExisting) {
            logger.error("User already exists");
            return res.status(409).json({
                msg: "Invalid Credentials!",
            });
        }

        const user = await prisma.user.create({
            data: {
                username,
                email,
                passwordHash: await bcrypt.hash(password, 10),
            },
        });

        const { access_token, refresh_token } = await user_tokens(
            user.id,
            user.username
        );

        res.cookie("refreshToken", refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(201).json({
            success: true,
            msg: "User registered successfully",
            access_token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (err) {
        if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2002"
        ) {
            logger.error("User already exists");
            return res.status(409).json({
                msg: "User already exists!",
            });
        }

        next(err);
    }
}

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const { identifier, password } = req.body;

        const isIdentifierEmail = z.email().safeParse(identifier).success;

        const user = isIdentifierEmail? await prisma.user.findFirst({
                where: { email: identifier },
            })
            : await prisma.user.findFirst({
                where: { username: identifier },
            });

        if (!user) {
            logger.info("Invalid credentials");

            return res.status(401).json({
                msg: "Invalid Credentials!",
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!isPasswordValid) {
            logger.info("Invalid credentials");

            return res.status(401).json({
                msg: "Invalid Credentials!",
            });
        }

        const { access_token, refresh_token } =
            await user_tokens(user.id, user.username);

        res.cookie("refreshToken", refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            msg: "Logged in successfully",
            access_token,
            user: {
                user_id: user.id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (err) {
        next(err);
    }
}

export async function logout(req: Request, res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
        const hashedToken = crypto.createHash("sha256")
            .update(refreshToken).digest("hex");

        try {
            await prisma.refreshToken.deleteMany({
                where: {
                    tokenHash: hashedToken,
                },
            });
        } catch (err) {
            console.error(
                "Failed to delete refresh token from database during logout:",
                err
            );

            return res.status(500).json({
                success: false,
                msg: "Failed to log out. Please try again.",
            });
        }
    }

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });

    return res.json({
        success: true,
        msg: "Logged out successfully.",
    });
}