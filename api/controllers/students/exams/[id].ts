import { compare } from 'bcrypt';
import { Request, Response, NextFunction } from 'express';

const fetchExam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { password } = req.body;
    const details: Buffer = await res.locals.studentContract.evaluateTransaction(
      'FetchExam',
      req.params.id,
    );
    const exam = JSON.parse(details.toString());
    exam.Live = exam.Live === '1';
    if (await compare(password, exam.Password)) {
      res.locals.exam = exam;
      next();
    } else {
      res.status(401).json({ error: 'Incorrect password' });
    }
  } catch (err) {
    res.status(500).json({ error: `Exam not found: ${err}` });
  }
};

export default fetchExam;
