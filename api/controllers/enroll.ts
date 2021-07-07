import { Request, Response } from 'express';
import { caClientExaminers, caClientStudents, pool } from '../app';
import { issueIdentity } from '../utils/CAUtil';

const examinersMspId = 'ExaminersMSP';
const studentsMspId = 'StudentsMSP';

const enrollExaminers = async (req: Request, res: Response) => {
  const { name, username, secret }: { name: string, username: string; secret: string } = req.body;
  if (name && username && secret) {
    const exists = await pool.query('SELECT * FROM examiners WHERE email = $1', [username]);
    if (!exists.rowCount) {
      console.log('does not exist');
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
      return pool.query('INSERT INTO examiners VALUES($1, $2)', [username, name]);
    }
    return res.status(409).json({ error: 'Examiner already enrolled' });
  }
  return res.status(401).json({ error: 'Name, username and secret are required' });
};

const enrollStudents = async (req: Request, res: Response) => {
  const {
    name,
    username,
    secret,
    rollNumber,
  }: { name: string, username: string; secret: string, rollNumber: string } = req.body;

  if (name && username && secret && rollNumber) {
    const exists = await pool.query('SELECT * FROM students WHERE roll = $1', [rollNumber]);
    if (!exists.rowCount) {
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
      await pool.query('INSERT INTO students VALUES($1, $2, $3)', [rollNumber, name, username]);
    } else {
      res.status(409).json({ error: 'Student already enrolled' });
    }
  } else {
    res.status(401).json({ error: 'Name, username, secret and roll number are required' });
  }
};

export { enrollExaminers, enrollStudents };
