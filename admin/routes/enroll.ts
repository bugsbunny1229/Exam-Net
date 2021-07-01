import { Router } from 'express';
import { registerExaminer } from '../controllers/enroll';

const enrollRouter = Router();
enrollRouter.post('/examiners', registerExaminer);

export default enrollRouter;
