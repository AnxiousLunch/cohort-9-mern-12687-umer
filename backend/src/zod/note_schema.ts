// enforce note id as a clamped integer

// create schema

// delete and get do not require schemas as they are not inputs

//update schema


import {z} from "zod";


export const idParam = z.object({
  id: z.coerce.number().int().positive(),
});

export const noteIdParamSchema = z.object({
  params: idParam,
});

export const createNoteSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(255),
    content: z.string(),
  }),
});

export const updateNoteSchema = z.object({
  params: idParam,
  body: z.object({
    title: z.string().trim().min(1).max(255).optional(),
    content: z.string().optional(),
  }).refine(
    data => data.title !== undefined || data.content !== undefined,
    {
      message: "Provide at least one field to update.",
    }
  ),
});

export type NoteInput = z.infer<typeof createNoteSchema>["body"];
export type NoteUpdate = z.infer<typeof updateNoteSchema>["body"];