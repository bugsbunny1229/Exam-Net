import { Request, Response } from 'express';

const fetchResults = async (req: Request, res: Response) => {
  const resultBuffer: Buffer = await res.locals.studentContract.submitTransaction(
    'FetchResultsByExam',
    req.params.examId,
  );
  let results: any = JSON.parse(resultBuffer.toString());
  results = results.map((r: any) => (
    {
      Title: r.Title,
      ID: r.ID,
      ExamID: r.ExamID,
      AnswerSheetID: r.AnswerSheetID,
      Examiner: r.Examiner,
      RollNumber: r.RollNumber,
      Address: r.Address,
      Signature: r.Signature,
    }
  ));
  res.json({ results });
};

export default fetchResults;
