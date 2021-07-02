import { Router } from 'express';
import { registerExaminer, registerStudents } from '../controllers/register';

const registerRouter = Router();
registerRouter.post('/examiners', registerExaminer);
registerRouter.post('/students', registerStudents);

export default registerRouter;
