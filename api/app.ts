import cors, { CorsOptions } from 'cors';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { Pool } from 'pg';
import { isExaminerAuth, isStudentAuth } from './middleware/auth';
import enrollRouter from './routes/enroll';
import examRouter from './routes/examiners';
import studentExamRouter from './routes/students/exams';
import studentSubmitRouter from './routes/students/submit';
import { buildCAClient } from './utils/CAUtil';
import { buildCCPExaminers, buildCCPStudents } from './utils/AppUtil';

dotenv.config();
const app = express();
const PORT = 10000;
const corsOptions: CorsOptions = {
  origin: 'http://localhost:5000',
};
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.static('public'));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  }),
);

const ccpExaminers = buildCCPExaminers();
const ccpStudents = buildCCPStudents();
// build an instance of the fabric ca services client based on
// the information in the network configuration
const caClientExaminers = buildCAClient(ccpExaminers, 'ca.examiners.iiitm.com');
const caClientStudents = buildCAClient(ccpStudents, 'ca.students.iiitm.com');
const pool = new Pool();

const examinerAuthMiddleware = async (
  req: Request, res: Response, next: NextFunction,
) => isExaminerAuth(req, res, next, ccpExaminers);

const studentAuthMiddleware = async (
  req: Request, res: Response, next: NextFunction,
) => isStudentAuth(req, res, next, ccpStudents);

app.use('/enroll', enrollRouter);

app.use('/examiners/exams', examinerAuthMiddleware, examRouter);
app.use('/students/exams', studentAuthMiddleware, studentExamRouter);
app.use('/students/submit', studentAuthMiddleware, studentSubmitRouter);
app.get('*', (req: Request, res: Response) => res.status(404).json({ error: 'Does not exist' }));

app.listen(PORT, async () => {
  await pool.connect();
  console.log('Database connected');
  console.log(`Listening on port ${PORT}`);
});

export {
  caClientExaminers,
  caClientStudents,
  ccpExaminers,
  ccpStudents,
  pool,
};
