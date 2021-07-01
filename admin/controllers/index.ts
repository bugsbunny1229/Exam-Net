import { Request, Response } from 'express';
import storage from 'node-persist';
import { enrollAdmin } from '../utils/CAUtil';
import {
  caClientExaminers, caClientStudents, mspExaminers, mspStudents,
} from '../app';

const enrollAdminController = async (req: Request, res: Response) => {
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
};

export default enrollAdminController;
