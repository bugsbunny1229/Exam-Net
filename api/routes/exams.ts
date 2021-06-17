import express, {
  Router, Request, Response, NextFunction,
} from 'express';

const examRouter: Router = express.Router();

examRouter.post('/', async (req: Request, res: Response) => {
  try {
    const result: Buffer = await res.locals.contract.evaluateTransaction('GetAllExams');
    res.json({ exams: JSON.parse(result.toString()) });
  } catch (err) {
    res.status(500).json({ error: `Failed to execute transaction: ${err}` });
  }
});

examRouter.post('/new', async (req: Request, res: Response) => {
  try {
    const {
      title, username, subject, date, duration, password, address,
    }:
      {
        title: string,
        username: string,
        subject: string,
        date: string,
        duration: number,
        password: string,
        address: string,
      } = req.body;

    const live: boolean = req.body.live ?? true;
    if (title && subject && date && duration && password && address) {
      const paperID: string = Buffer.from(Math.random().toString()).toString('base64').substring(3, 24);
      const paperBuffer: Buffer = await res.locals.contract.submitTransaction('CreateExam', paperID, username, title, subject, date, duration.toString(), password, address, live ? '1' : '0');
      res.json({ message: paperBuffer.toJSON() });
    } else {
      res.status(400).json({ error: 'id, title, subject, date, duration, password and file are required' });
    }
  } catch (err) {
    res.status(500).json({ error: `Failed to execute transaction: ${err}` });
  }
});

examRouter.param('id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const details: Buffer = await res.locals.contract.evaluateTransaction('FetchExam', req.params.id);
    res.locals.exam = JSON.parse(details.toString());
    next();
  } catch (err) {
    res.status(500).json({ error: `Exam not found: ${err}` });
  }
});

examRouter.route('/:id')
  .post(async (req: Request, res: Response) => res.json({ exam: res.locals.exam }));

examRouter.post('/:id/schedule', async (req: Request, res: Response) => {
  try {
    const {
      ID,
      Title,
      Subject,
      Date,
      Duration,
      Password,
      Address,
      Live,
      Examiner,
    } = res.locals.exam;
    const paperBuffer: Buffer = await res.locals.studentContract.submitTransaction('CreateExam', ID, Examiner, Title, Subject, Date, Duration.toString(), Password, Address, Live ? '1' : '0');
    res.json({ message: paperBuffer.toJSON() });
  } catch (err) {
    res.status(500).json({ error: `Failed to execute transaction: ${err}` });
  }
});

export default examRouter;
