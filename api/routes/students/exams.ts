import { Router, Response } from 'express';
import fetchAllExams from '../../controllers/students/exams/exams';
import fetchExam from '../../controllers/students/exams/[id]';

const studentExamRouter: Router = Router();

studentExamRouter.post('/', fetchAllExams);
studentExamRouter.param('id', fetchExam);
studentExamRouter.post('/:id', (_req, res: Response) => res.json({ exam: res.locals.exam }));
export default studentExamRouter;
