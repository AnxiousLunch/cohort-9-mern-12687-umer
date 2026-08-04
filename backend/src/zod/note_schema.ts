// enforce note id as a clamped integer

// create schema

// delete and get do not require schemas as they are not inputs

//update schema


import {z} from "zod";


const idParam = z.object({
  id: z.string().regex(/^\d+$/, 'Document id must be a positive integer'),
});

export const createDocumentSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(255),
  }),
});

export const updateDocumentSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(255),
    content: z.unknown(),
  }),
  params: idParam,
});



export type DocumentInput = z.infer<typeof createDocumentSchema>['body'];
export type DocumentUpdate = z.infer<typeof updateDocumentSchema>['body'];