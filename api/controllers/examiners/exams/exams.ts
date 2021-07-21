import { hash } from 'bcrypt';
import { Request, Response } from 'express';

const fetchAllExams = async (_req: Request, res: Response) => {
  try {
    const result: Buffer = await res.locals.contract.evaluateTransaction(
      'GetAllExams',
    );
    res.json({ exams: JSON.parse(result.toString()) });
  } catch (err) {
    res.status(500).json({
      error: `Failed to execute transaction: ${err}`,
    });
  }
};

const newExam = async (req: Request, res: Response) => {
  try {
    const {
      title,
      username,
      subject,
      date,
      duration,
      password,
      address,
    }: {
      title: string;
      username: string;
      subject: string;
      date: string;
      duration: number;
      password: string;
      address: string;
    } = req.body;

    const live: boolean = req.body.live ?? false;
    if (title && subject && date && duration && password && address) {
      const passwordHash = await hash(password, 12);
      const paperID: string = Buffer.from(Math.random().toString())
        .toString('base64')
        .substring(3, 24);
      const paperBuffer: Buffer = await res.locals.contract.submitTransaction(
        'CreateExam',
        paperID,
        username,
        title,
        subject,
        date,
        duration.toString(),
        passwordHash,
        address,
        live ? '1' : '0',
        res.locals.examinerKey,
      );
      res.json({ message: paperBuffer.toJSON() });
    } else {
      res.status(400).json({
        error: 'id, title, subject, date, duration, password and file are required',
      });
    }
  } catch (err) {
    res.status(500).json({
      error: `Failed to execute transaction: ${err}`,
    });
  }
};

export {
  fetchAllExams,
  newExam,
};
