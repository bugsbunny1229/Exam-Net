import { Request, Response } from 'express';

const newResult = async (req: Request, res: Response) => {
  try {
    const { address, signature }: { address: string; signature: string; } = req.body;
    if (address && signature) {
      const resultId: string = Buffer.from(Math.random().toString())
        .toString('base64')
        .substring(3, 24);
      await res.locals.studentContract.submitTransaction(
        'PublishResult',
        resultId,
        req.params.id,
        address,
        signature,
      );
      res.json({ id: resultId });
    } else {
      res.status(400).json({
        error: 'Address and signature are required',
      });
    }
  } catch (err) {
    res.status(500).json({
      error: `Failed to publish result: ${err}`,
    });
  }
};

export default newResult;
