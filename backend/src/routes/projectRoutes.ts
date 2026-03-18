import { Router } from 'express';
import { createProject, getProject } from '../controllers/projectController.js';

const router = Router();

router.post('/projects', createProject);
router.get('/projects/:id', getProject);

export default router;
