import { Router } from 'express';
import { enrollExaminers, enrollStudents } from '../controllers/enroll';

const enrollRouter = Router();
enrollRouter.post('/examiners', enrollExaminers);
enrollRouter.post('/students', enrollStudents);

export default enrollRouter;
