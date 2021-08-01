import { Router } from 'express';
import fetchResult from '../../controllers/students/results/[id]';

const studentResultsRouter: Router = Router();
studentResultsRouter.post('/:examId', fetchResult);

export default studentResultsRouter;
