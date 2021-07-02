/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Request, Response } from 'express';
import { Wallet, Wallets } from 'fabric-network';
import fs from 'fs';
import { Transporter } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import path from 'path';

const buildCCPExaminers = (): Record<string, any> => {
  // load the common connection configuration file
  const ccpPath = path.resolve(
    '../network/organizations/peerOrganizations/examiners.iiitm.com/connection-examiners.json',
  );
  const fileExists = fs.existsSync(ccpPath);
  if (!fileExists) {
    throw new Error(`no such file or directory: ${ccpPath}`);
  }
  const contents = fs.readFileSync(ccpPath, 'utf8');

  // build a JSON object from the file contents
  const ccp = JSON.parse(contents);

  console.log(`Loaded the network configuration located at ${ccpPath}`);
  return ccp;
};

const buildCCPStudents = (): Record<string, any> => {
  // load the common connection configuration file
  const ccpPath = path.resolve(
    '../network/organizations/peerOrganizations/students.iiitm.com/connection-students.json',
  );
  const fileExists = fs.existsSync(ccpPath);
  if (!fileExists) {
    throw new Error(`no such file or directory: ${ccpPath}`);
  }
  const contents = fs.readFileSync(ccpPath, 'utf8');

  // build a JSON object from the file contents
  const ccp = JSON.parse(contents);

  console.log(`Loaded the network configuration located at ${ccpPath}`);
  return ccp;
};

const buildWallet = async (walletPath?: string): Promise<Wallet> => {
  // Create a new  wallet : Note that wallet is for managing identities.
  let wallet: Wallet;
  if (walletPath) {
    wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Built a file system wallet at ${walletPath}`);
  } else {
    wallet = await Wallets.newInMemoryWallet();
    console.log('Built an in memory wallet');
  }

  return wallet;
};

const prettyJSONString = (inputString: string): string => {
  if (inputString) {
    return JSON.stringify(JSON.parse(inputString), null, 2);
  }
  return inputString;
};

const sendMail = async (
  req: Request,
  res: Response,
  transporter: Transporter,
  name: string,
  username: string,
  secret: string,
) => {
  if (req.body.identity && req.body.username) {
    try {
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
    }
  } else {
    res.status(400).json({ error: 'Username and identity are both required' });
  }
};

export {
  buildCCPExaminers, buildCCPStudents, buildWallet, prettyJSONString, sendMail,
};
