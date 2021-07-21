import { Request, Response } from 'express';

const submitExam = async (req: Request, res: Response) => {
  try {
    const { examId, address, key }: { examId: string; address: string; key: string; } = req.body;
    const answerSheetId: string = Buffer.from(Math.random().toString()).toString('base64').substring(3, 24);
    const result = JSON.parse((await res.locals.studentContract.evaluateTransaction('FetchExam', examId)).toString());
    const date = new Date(result.Date);
    if (Date.now() <= result.Duration * 60000 + date.getTime()) {
      await res.locals.studentContract.submitTransaction('SubmitExam', answerSheetId, examId, address, key);
      res.json({ id: answerSheetId });
    } else {
      res.status(400).json({ error: 'The time for submissions has ended' });
    }
  } catch (err) {
    res.status(500).json({ error: `Error: ${err}` });
  }
};

export default submitExam;
