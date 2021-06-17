import cors, { CorsOptions } from 'cors';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import storage from 'node-persist';
import isAuth from './middleware/auth';
import examRouter from './routes/exams';
import { buildCAClient, enrollUser } from './utils/CAUtil';
import { buildCCPExaminers } from './utils/AppUtil';

const app = express();
const PORT = 10000;
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

const ccp = buildCCPExaminers();
// build an instance of the fabric ca services client based on
// the information in the network configuration
const caClient = buildCAClient(
  ccp,
  'ca.examiners.iiitm.com',
);

const authMiddleware = async (
  req: Request,
  res: Response,
  next: Function,
) => isAuth(req, res, next, ccp);

app.post('/', async (req: Request, res: Response) => {
  const { username, secret }: { username: string, secret: string } = req.body;

  if (username && secret) {
    // setup the wallet to hold the credentials of the application user
    const isEnrolled: Boolean = await storage.getItem(username);
    if (!isEnrolled) {
      try {
        const identity = await enrollUser(caClient, username, secret);
        res.json({ identity: JSON.stringify(identity) });
        await storage.updateItem(username, true);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    } else {
      res.status(409).json({ error: 'User already enrolled' });
    }
  } else {
    res.status(401).json({ error: 'Username and secret are required' });
  }
});

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

export default ccp;
