import type { NextFunction, Request, Response } from "express";
import logger from "../services/logger.js";

import prisma from "../../prisma/adapter.js";
import { AppError } from "../middleware/error_middleware.js";
import type { NoteInput, NoteUpdate } from "../zod/note_schema.js";
import {Prisma} from "../../prisma/generated/prisma/client.js";


export async function createNote(req: Request<{}, {}, NoteInput>, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.userId;
        const { title, content = "" } = req.body;

        const note = await prisma.note.create({
            data: {
                userId,
                title,
                content,
            },
        });

        logger.info(`Note created: ${note.id}`);

        res.status(201).json({
            success: true,
            message: "Note created",
            note,
        });
    } catch (err) {
        next(err);
    }
}

export async function getUserNotes(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.userId;

        const notes = await prisma.note.findMany({
            where: {
                userId,
            },
            orderBy: {
                updatedAt: "desc",
            },
        });

        logger.info(`Fetched ${notes.length} notes for user ${userId}`);

        res.json({
            success: true,
            notes,
        });
    } catch (err) {
        next(err);
    }
}

export async function getUserNoteById(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.userId;

        const note = await prisma.note.findFirst({
            where: {
                id: Number(req.params.id),
                userId,
            },
        });

        if (!note) {
            throw new AppError(404, "Note not found");
        }

        logger.info(`Fetched note ${note.id}`);

        res.json({
            success: true,
            note,
        });
    } catch (err) {
        next(err);
    }
}

export async function updateUserNote(req: Request<{id: string}, {}, NoteUpdate>, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.userId;
        const { title, content, lastSeenUpdatedAt } = req.body;

        const lastSeenDate = new Date(lastSeenUpdatedAt);

        if (Number.isNaN(lastSeenDate.getTime())) {
            throw new AppError(400, "Invalid lastSeen date received");
        }
        try {
            await prisma.note.update({
                where: {
                    id: Number(req.params.id),
                    userId,
                    updatedAt: lastSeenDate
                },
                data: {
                    title,
                    content,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
                const note = await prisma.note.findFirst({
                    where: {
                        id:Number(req.params.id) ,
                        userId,
                    },
                    select: {
                        id: true,
                    },
                });

                if (!note) {
                    throw new AppError(404, "Note not found");
                }

                throw new AppError(409, "Note was modified by another session");
            }

            throw error;
        }

        const actuallyUpdateNote = await prisma.note.findFirst({
            where: {
                id: Number(req.params.id),
                userId
            }
        });

        if (!actuallyUpdateNote) {
            throw new AppError(404, "Note not found");
        }

        logger.info(`Updated note ${actuallyUpdateNote.id}`);

        res.json({
            success: true,
            note: actuallyUpdateNote,
        });
    } catch (err) {
        next(err);
    }
}

export async function deleteUserNote(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.userId;
        const noteId = Number(req.params.id);
        logger.info(`User id is ${userId}, note id is ${noteId}`)
        const note = await prisma.note.findFirst({
            where: {
                id: noteId,
                userId,
            },
        });

        if (!note) {
            throw new AppError(404, "Note not found");
        }

        logger.info({ noteId, userId }, "Deleting note");

        await prisma.note.delete({
            where: {
                id: noteId,
            },
        });

        logger.info(`Deleted note ${noteId}`);

        res.json({
            success: true,
            message: "Note deleted successfully",
        });
    } catch (err) {
        next(err);
    }
}