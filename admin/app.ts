import cors, { CorsOptions } from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { Identity, Wallet } from 'fabric-network';
import helmet from 'helmet';
import nodemailer from 'nodemailer';
import storage from 'node-persist';
import Mail from 'nodemailer/lib/mailer';
import { buildCAClient, registerUser, enrollAdmin } from './utils/CAUtil';
import { buildCCPExaminers, buildCCPStudents, buildWallet } from './utils/AppUtil';

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

app.post('/', async (req: Request, res: Response) => {
  const { username, password }: { username: string, password: string } = req.body;
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PW;

  if (username === adminUsername && password === adminPassword) {
    // setup the wallet to hold the credentials of the application user
    const isEnrolled: Boolean = await storage.getItem(adminUsername);
    if (!isEnrolled) {
      const identityExaminers = await enrollAdmin(caClientExaminers, mspExaminers);
      const identityStudents = await enrollAdmin(caClientStudents, mspStudents);
      res.json({
        identityExaminers,
        identityStudents,
      });
      await storage.updateItem(adminUsername, true);
    } else {
      res.status(409).json({ error: 'Admin already enrolled' });
    }
  } else {
    res.status(401).json({ error: 'Incorrect username or password' });
  }
});

app.post('/examiners', async (req: Request, res: Response) => {
  if (req.body.identity && req.body.username) {
    try {
      // console.log(JSON.parse(req.body.identity));
      // const { identity } = req.body;
      const { identity, name, username }:
        {
          identity: Identity,
          name: string,
          username: string
        } = req.body;
      let wallet: Wallet = await buildWallet();
      await wallet.put(process.env.ADMIN_USERNAME, identity);
      try {
        const secret = await registerUser(
          caClientExaminers,
          wallet,
          username,
          'examiners.examiners',
          [{
            name: 'Name',
            value: name,
            ecert: true,
          },
          {
            name: 'Email',
            value: username,
            ecert: true,
          }],
        );
        const mail: Mail.Options = {
          from: 'ExamNet <harshhsharma23@gmail.com>',
          to: username,
          subject: 'Enrollment Secret',
          text: `Hello ${name}, Your enrollment secret is: ${secret}`,
          html: `Hello ${name}, <p>Your enrollment secret is: ${secret}</p>`,
        };
        transporter.sendMail(mail, (error, info) => {
          if (error) {
            console.error(error);
            res.status(500).json({ error });
          } else {
            res.json({ message: `Mail sent: ${info.messageId}` });
          }
        });
      } catch (err) {
        res.status(500).json({ error: `Failed to register user: ${err}` });
      } finally {
        wallet = null;
      }
    } catch (err) {
      res.status(500).json({ error: `Couldn't register the user: ${err}` });
    }
  } else {
    res.status(400).json({ error: 'Username and identity are both required' });
  }
});

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
