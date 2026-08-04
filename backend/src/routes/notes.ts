// Startpoint for doc routes
// get all, get one (id), post (one), update(one), delete(one)

// Starting point for note route logic

import { Router } from 'express';

import { createNote,
      getUserNotes,
  getUserNoteById,
  updateUserNote,
  deleteUserNote,
 } from '../controllers/notesController.js';
import { validate } from '../middleware/zod_middleware.js';
import { createNoteSchema, idParam, updateNoteSchema } from '../zod/note_schema.js';

const router = Router();


router.post('/',        validate(createNoteSchema), createNote);
router.get('/',                                     getUserNotes);
router.get('/:id',      validate(idParam),          getUserNoteById);
router.put('/:id',      validate(updateNoteSchema), updateUserNote);
router.delete('/:id',   validate(idParam),          deleteUserNote);

export default router;