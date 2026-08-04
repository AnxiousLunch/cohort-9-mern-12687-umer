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

const router = Router();


router.post('/', createNote);
router.get('/', getUserNotes);
router.get('/:id', getUserNoteById);
router.put('/:id', updateUserNote);
router.delete('/:id', deleteUserNote);

export default router;