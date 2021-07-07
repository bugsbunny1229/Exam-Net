import { Request, Response } from 'express';

const fetchAllExams = async (_req: Request, res: Response) => {
  try {
    const result: Buffer = await res.locals.studentContract.evaluateTransaction(
      'GetAllExams',
    );
    let exams: any = JSON.parse(result.toString());
    exams = exams.map((e: any) => (
      {
        Title: e.Exam.Title,
        Subject: e.Exam.Subject,
        Live: e.Exam.Live,
        Date: e.Exam.Date,
        Duration: e.Exam.Duration,
        ID: e.Exam.ID,
        Examiner: e.Exam.Examiner,
      }
    ));
    res.json({ exams });
  } catch (err) {
    res.status(500).json({
      error: `Failed to execute transaction: ${err}`,
    });
  }
};

export default fetchAllExams;
