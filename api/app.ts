import cors, { CorsOptions } from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import storage from 'node-persist';
import isAuth from './middleware/auth';
import enrollRouter from './routes/enroll';
import examRouter from './routes/exams';
import { buildCAClient } from './utils/CAUtil';
import { buildCCPExaminers, buildCCPStudents } from './utils/AppUtil';

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

const authMiddleware = async (
  req: Request, res: Response, next: NextFunction,
) => isAuth(req, res, next, ccpExaminers);

app.use('/enroll', enrollRouter);
app.use('/exams', authMiddleware, examRouter);
app.get('*', (req: Request, res: Response) => res.status(404).json({ error: 'Does not exist' }));

app.listen(PORT, async () => {
  await storage.init({
    dir: './wallet',
    stringify: JSON.stringify,
    parse: JSON.parse,
    encoding: 'utf8',
    logging: false,
    expiredInterval: 2 * 60 * 1000,
    forgiveParseErrors: false,
  });
  console.log(`Listening on port ${PORT}`);
});

export {
  caClientExaminers,
  caClientStudents,
  ccpExaminers,
  ccpStudents,
};
