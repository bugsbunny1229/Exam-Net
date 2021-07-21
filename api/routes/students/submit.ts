import { Router } from 'express';
import submitExam from '../../controllers/students/submit/submit';

const studentSubmitRouter: Router = Router();

studentSubmitRouter.post('/:id', submitExam);
export default studentSubmitRouter;
