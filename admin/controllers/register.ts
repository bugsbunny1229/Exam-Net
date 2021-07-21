import { Request, Response } from 'express';
import { Identity, Wallet } from 'fabric-network';
import { caClientExaminers, caClientStudents, transporter } from '../app';
import { buildWallet, sendMail } from '../utils/AppUtil';
import { registerUser } from '../utils/CAUtil';

const registerExaminer = async (req: Request, res: Response) => {
  const { identity, name, username }:
    {
      identity: Identity,
      name: string,
      username: string
    } = req.body;
  const wallet: Wallet = await buildWallet();
  await wallet.put(process.env.ADMIN_USERNAME, identity);

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
  await sendMail(req, res, transporter, name, username, secret);
};

const registerStudents = async (req: Request, res: Response) => {
  const {
    identity, name, username, rollNumber,
  }:
    {
      identity: Identity,
      name: string,
      username: string,
      rollNumber: string,
    } = req.body;
  const wallet: Wallet = await buildWallet();
  await wallet.put(process.env.ADMIN_USERNAME, identity);

  const secret = await registerUser(
    caClientStudents,
    wallet,
    username,
    `students.batch2019.${rollNumber.slice(4, 7)}`,
    [{
      name: 'Name',
      value: name,
      ecert: true,
    },
    {
      name: 'Email',
      value: username,
      ecert: true,
    },
    {
      name: 'RollNumber',
      value: rollNumber,
      ecert: true,
    }],
  );
  await sendMail(req, res, transporter, name, username, secret);
};

export { registerExaminer, registerStudents };
