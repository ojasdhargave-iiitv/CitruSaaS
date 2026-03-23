import { Router } from 'express';
import { createProject, getProject, listProjects, deleteProject } from '../controllers/projectController.js';

const router = Router();

router.post('/projects', createProject);
router.get('/projects', listProjects);
router.get('/projects/:id', getProject);
router.delete('/projects/:id', deleteProject);

export default router;
