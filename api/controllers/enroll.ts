import { Request, Response } from 'express';
import { caClientExaminers, caClientStudents } from '../app';
import { issueIdentity } from '../utils/CAUtil';

const examinersMspId = 'ExaminersMSP';
const studentsMspId = 'StudentsMSP';

const enrollExaminers = async (req: Request, res: Response) => {
  const { name, username, secret }: { name: string, username: string; secret: string } = req.body;

  if (name && username && secret) {
    await issueIdentity(res, username, secret, caClientExaminers, examinersMspId, [
      {
        name: 'Name',
        optional: false,
      },
      {
        name: 'Email',
        optional: false,
      },
    ]);
  } else {
    res.status(401).json({ error: 'Name, username and secret are required' });
  }
};

const enrollStudents = async (req: Request, res: Response) => {
  const {
    name,
    username,
    secret,
    rollNumber,
  }: { name: string, username: string; secret: string, rollNumber: string } = req.body;

  if (name && username && secret && rollNumber) {
    await issueIdentity(res, username, secret, caClientStudents, studentsMspId, [
      {
        name: 'Name',
        optional: false,
      },
      {
        name: 'Email',
        optional: false,
      },
      {
        name: 'RollNumber',
        optional: false,
      },
    ]);
  } else {
    res.status(401).json({ error: 'Name, username, secret and roll number are required' });
  }
};

export { enrollExaminers, enrollStudents };
