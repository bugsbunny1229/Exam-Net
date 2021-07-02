import { Router, Response } from 'express';
import {
  fetchAllExams,
  fetchExam,
  newExam,
  scheduleExam,
  cancelExam,
} from '../controllers/exams';

const examRouter: Router = Router();

examRouter.post('/', fetchAllExams);
examRouter.post('/new', newExam);
examRouter.param('id', fetchExam);

examRouter
  .route('/:id')
  .post((_, res: Response) => res.json({ exam: res.locals.exam }));

examRouter.post('/:id/schedule', scheduleExam);
examRouter.post('/:id/cancel', cancelExam);

export default examRouter;
