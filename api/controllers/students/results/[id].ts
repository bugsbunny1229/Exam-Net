import { Request, Response } from 'express';

const fetchResults = async (req: Request, res: Response) => {
  try {
    const resultBuffer: Buffer = await res.locals.studentContract.evaluateTransaction('GetResult', req.params.examId);
    res.json({ result: JSON.parse(resultBuffer.toString()) });
  } catch (err) {
    res.status(500).json({ error: `Could not fetch result: ${err}` });
  }
};

export default fetchResults;
