import { Router, Response } from 'express';
import { fetchAllExams, newExam } from '../controllers/examiners/exams/exams';
import {
  fetchExam,
  scheduleExam,
  cancelExam,
  updateExam,
  deleteExam,
} from '../controllers/examiners/exams/[id]';

const examRouter: Router = Router();

examRouter.post('/', fetchAllExams);
examRouter.post('/new', newExam);
examRouter.param('id', fetchExam);

examRouter
  .route('/:id')
  .post((_req, res: Response) => res.json({ exam: res.locals.exam }))
  .patch(updateExam)
  .delete(deleteExam);

examRouter.post('/:id/schedule', scheduleExam);
examRouter.post('/:id/cancel', cancelExam);

export default examRouter;
