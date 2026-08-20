import type { NextFunction, Request, Response } from "express";
import logger from "../services/logger.js";

import prisma from "../../prisma/adapter.js";
import { AppError } from "../middleware/error_middleware.js";
import type { NoteInput, NoteUpdate } from "../zod/note_schema.js";
import { act } from "react";


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

        if (Number.isNaN(lastSeenDate)) {
            throw new AppError(400, "Invalid lastSeen date received");
        }

        // const note = await prisma.note.findFirst({
        //     where: {
        //         id: Number(req.params.id),
        //         userId,
        //     },
        // });

        // if (!note) {
        //     throw new AppError(404, "Note not found");
        // }

        const updatedNote = await prisma.note.updateMany({
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

        if (updatedNote.count == 0) {
            const note = await prisma.note.findFirst({
                where: {
                    id: Number(req.params.id),
                    userId
                },
                select: {
                    id: true
                }
            });

            if (!note) {
                throw new AppError(404, "App does not exist");
            }

            throw new AppError(409, "Note was modified by another session");
        }

        const actuallyUpdateNote = await prisma.note.findFirst({
            where: {
                id: Number(req.params.id),
                userId
            }
        });

        logger.info(`Updated note ${actuallyUpdateNote!.id}`); // assert here because we check beforehand that note exists or not with the updatedNOte.count check so even if typescript asserts here thaat actuallyUpdatedNote is null, it is in fact not. I rest my case your honor

        res.json({
            success: true,
            message: "Note updated",
            note: act,
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