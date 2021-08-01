import { Router } from 'express';
import fetchResults from '../../controllers/examiners/results/[examId]';
import newResult from '../../controllers/examiners/results/[id]';

const examinersResultsRouter: Router = Router();

examinersResultsRouter.post('/exams/:examId', fetchResults);
examinersResultsRouter.post('/:id', newResult);
export default examinersResultsRouter;
