import { Router } from 'express';
import enrollAdminController from '../controllers';

const indexRouter = Router();
indexRouter.post('/', enrollAdminController);

export default indexRouter;
