import { Request, Response } from 'express';
import { Identity, Wallet } from 'fabric-network';
import Mail from 'nodemailer/lib/mailer';
import { caClientExaminers, transporter } from '../app';
import { buildWallet } from '../utils/AppUtil';
import { registerUser } from '../utils/CAUtil';

const registerExaminer = async (req: Request, res: Response) => {
  if (req.body.identity && req.body.username) {
    try {
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
};

export { registerExaminer };
