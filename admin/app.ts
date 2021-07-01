import cors, { CorsOptions } from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import nodemailer from 'nodemailer';
import storage from 'node-persist';
import indexRouter from './routes';
import registerRouter from './routes/enroll';
import { buildCAClient } from './utils/CAUtil';
import { buildCCPExaminers, buildCCPStudents } from './utils/AppUtil';

dotenv.config();
const app = express();
const PORT = 8080;
const corsOptions: CorsOptions = {
  origin: 'http://localhost:5000',
};
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({
  extended: true,
}));

const mspExaminers = 'ExaminersMSP';
const mspStudents = 'StudentsMSP';
const ccpExaminers = buildCCPExaminers();
const ccpStudents = buildCCPStudents();

// build an instance of the fabric ca services client based on
// the information in the network configuration
const caClientExaminers = buildCAClient(
  ccpExaminers,
  'ca.examiners.iiitm.com',
);

const caClientStudents = buildCAClient(
  ccpStudents,
  'ca.students.iiitm.com',
);

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    type: 'OAuth2',
    user: process.env.GMAIL_USERNAME,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.OAUTH_REFRESH_TOKEN,
    accessToken: process.env.OAUTH_ACCESS_TOKEN,
  },
});

app.use('/register', registerRouter);
app.use('/', indexRouter);
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
  caClientExaminers, caClientStudents, mspExaminers, mspStudents, transporter,
};
