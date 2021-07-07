import { Router } from 'express';
import fetchAllExams from '../controllers/students/exams/exams';
import fetchExam from '../controllers/students/exams/[id]';

const studentRouter: Router = Router();

studentRouter.post('/', fetchAllExams);
studentRouter.post('/:id', fetchExam);

export default studentRouter;
