import type { NextFunction, Request, Response } from "express";
import logger from "../services/logger.js";

import prisma from "../../prisma/adapter.js";
import { AppError } from "../middleware/error_middleware.js";
import type { NoteInput, NoteUpdate } from "../zod/note_schema.js";


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
        const { title, content } = req.body;

        const note = await prisma.note.findFirst({
            where: {
                id: Number(req.params.id),
                userId,
            },
        });

        if (!note) {
            throw new AppError(404, "Note not found");
        }

        const updatedNote = await prisma.note.update({
            where: {
                id: Number(req.params.id),
            },
            data: {
                title,
                content,
            },
        });

        logger.info(`Updated note ${note.id}`);

        res.json({
            success: true,
            message: "Note updated",
            note: updatedNote,
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