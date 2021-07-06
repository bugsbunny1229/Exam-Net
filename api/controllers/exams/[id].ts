import { compare } from 'bcrypt';
import { Request, Response, NextFunction } from 'express';

const fetchExam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const details: Buffer = await res.locals.contract.evaluateTransaction(
      'FetchExam',
      req.params.id,
    );
    res.locals.exam = JSON.parse(details.toString());
    res.locals.exam.Live = JSON.parse(details.toString()).Live === '1';
    next();
  } catch (err) {
    res.status(500).json({ error: `Exam not found: ${err}` });
  }
};

const scheduleExam = async (req: Request, res: Response) => {
  try {
    const { password }: { password: string } = req.body;
    const {
      ID,
      Title,
      Subject,
      Date,
      Duration,
      Password,
      Address,
      Examiner,
      Live,
    } = res.locals.exam;
    if (await compare(password, Password)) {
      console.log(res.locals.exam);
      if (!Live) {
        const buf = await res.locals.contract.submitTransaction('ScheduleExam', ID);
        console.log(buf.toJSON());
        const paperBuffer: Buffer = await res.locals.studentContract.submitTransaction(
          'CreateExam',
          ID,
          Examiner,
          Title,
          Subject,
          Date,
          Duration.toString(),
          Password,
          Address,
        );
        res.json({ message: paperBuffer.toJSON() });
      } else {
        res.json({ message: 'Exam is already live' });
      }
    }
    res.status(403).json({ error: 'Invalid password' });
  } catch (err) {
    res.status(500).json({
      error: `Failed to execute transaction: ${err}`,
    });
  }
};

const cancelExam = async (_req: Request, res: Response) => {
  try {
    const {
      ID,
      Live,
    } = res.locals.exam;
    if (Live) {
      await res.locals.contract.submitTransaction('CancelExam', ID);
      await res.locals.studentContract.submitTransaction('DeleteExam', ID);
      res.json({ message: 'Cancelled' });
    } else {
      res.json({ message: 'Exam is already cancelled' });
    }
  } catch (err) {
    res.status(500).json({
      error: `Failed to execute transaction: ${err}`,
    });
  }
};

const updateExam = async (req: Request, res: Response) => {
  try {
    const {
      title,
      username,
      subject,
      date,
      duration,
    }: {
      title: string;
      username: string;
      subject: string;
      date: string;
      duration: number;
    } = req.body;

    if (title && subject && date && duration) {
      const currentExamBuf: Buffer = await res.locals.contract.evaluateTransaction(
        'FetchExam',
        req.params.id,
      );
      const currentExam = JSON.parse(currentExamBuf.toString());
      const paperBuffer: Buffer = await res.locals.contract.submitTransaction(
        'UpdateExam',
        req.params.id,
        username,
        title,
        subject,
        date,
        duration.toString(),
        currentExam.Password,
        currentExam.Address,
        currentExam.Live,
      );
      res.json({ message: paperBuffer.toJSON() });
    } else {
      res.status(400).json({
        error: 'id, title, subject, date, duration are required',
      });
    }
  } catch (err) {
    res.status(500).json({
      error: `Failed to execute transaction: ${err}`,
    });
  }
};

const deleteExam = async (req: Request, res: Response) => {
  try {
    const paperBuffer: Buffer = await res.locals.contract.submitTransaction('DeleteExam', req.params.id);
    await res.locals.studentContract.submitTransaction('DeleteExam', req.params.id);
    res.json({ message: paperBuffer.toJSON() });
  } catch (err) {
    res.status(500).json({
      error: `Failed to execute transaction: ${err}`,
    });
  }
};

export {
  fetchExam,
  scheduleExam,
  cancelExam,
  updateExam,
  deleteExam,
};
