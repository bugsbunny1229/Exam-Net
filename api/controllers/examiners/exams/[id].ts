import { compare } from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import { scheduleJob, scheduledJobs } from 'node-schedule';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { pool } from '../../../app';

const fetchExam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const details: Buffer = await res.locals.contract.evaluateTransaction(
      'FetchExam',
      req.params.id,
    );
    res.locals.exam = JSON.parse(details.toString());
    res.locals.exam.Live = JSON.parse(details.toString()).Live === '1';
    next();
  } catch (err) {
    res.status(500).json({ error: `Exam not found: ${err}` });
  }
};

const scheduleExam = async (req: Request, res: Response) => {
  try {
    const { password }: { password: string } = req.body;
    const {
      ID,
      Title,
      Subject,
      Duration,
      Password,
      Address,
      Examiner,
      Live,
      ExaminerKey,
    } = res.locals.exam;
    const date = res.locals.exam.Date;
    if (await compare(password, Password)) {
      if (!Live) {
        await res.locals.contract.submitTransaction('ScheduleExam', ID);
        await res.locals.studentContract.submitTransaction(
          'CreateExam',
          ID,
          Examiner,
          Title,
          Subject,
          date,
          Duration.toString(),
          Password,
          Address,
          ExaminerKey,
        );
        const emails = await pool.query('SELECT email FROM STUDENTS');
        if (emails.rowCount) {
          scheduleJob(ID, new Date(date), () => {
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
            const mail: Mail.Options = {
              from: 'ExamNet <harshhsharma23@gmail.com>',
              to: emails.rows.map((e) => e.email),
              subject: 'Exam Password',
              text: `Your exam password is: ${password}`,
              html: `Your exam password is: ${password}`,
            };
            transporter.sendMail(mail, (error, info) => {
              if (error) {
                console.error(error);
              } else {
                console.log({ message: `Mail sent: ${info.messageId}` });
              }
            });
          });
        }
      } else {
        res.json({ message: 'Exam is already live' });
      }
    }
    res.status(403).json({ error: 'Invalid password' });
  } catch (err) {
    res.status(500).json({
      error: `Failed to execute transaction: ${err}`,
    });
  }
};

const cancelExam = async (_req: Request, res: Response) => {
  try {
    const {
      ID,
      Live,
    } = res.locals.exam;
    if (Live) {
      await res.locals.contract.submitTransaction('CancelExam', ID);
      await res.locals.studentContract.submitTransaction('DeleteExam', ID);
      scheduledJobs[ID].cancel();
      res.json({ message: 'Cancelled' });
    } else {
      res.json({ message: 'Exam is already cancelled' });
    }
  } catch (err) {
    res.status(500).json({
      error: `Failed to execute transaction: ${err}`,
    });
  }
};

const updateExam = async (req: Request, res: Response) => {
  try {
    const {
      title,
      username,
      subject,
      date,
      duration,
    }: {
      title: string;
      username: string;
      subject: string;
      date: string;
      duration: number;
    } = req.body;

    if (title && subject && date && duration) {
      const currentExamBuf: Buffer = await res.locals.contract.evaluateTransaction(
        'FetchExam',
        req.params.id,
      );
      const currentExam = JSON.parse(currentExamBuf.toString());
      const paperBuffer: Buffer = await res.locals.contract.submitTransaction(
        'UpdateExam',
        req.params.id,
        username,
        title,
        subject,
        date,
        duration.toString(),
        currentExam.Password,
        currentExam.Address,
        currentExam.Live,
        currentExam.ExaminerKey,
      );
      res.json({ message: paperBuffer.toJSON() });
    } else {
      res.status(400).json({
        error: 'id, title, subject, date, duration are required',
      });
    }
  } catch (err) {
    res.status(500).json({
      error: `Failed to execute transaction: ${err}`,
    });
  }
};

const deleteExam = async (req: Request, res: Response) => {
  try {
    const paperBuffer: Buffer = await res.locals.contract.submitTransaction('DeleteExam', req.params.id);
    await res.locals.studentContract.submitTransaction('DeleteExam', req.params.id);
    res.json({ message: paperBuffer.toJSON() });
  } catch (err) {
    res.status(500).json({
      error: `Failed to execute transaction: ${err}`,
    });
  }
};

const fetchAnswerSheets = async (req: Request, res: Response) => {
  try {
    const details: Buffer = await res.locals.studentContract.evaluateTransaction(
      'GetAnswerSheets',
      req.params.id,
    );
    res.json({ answerSheets: JSON.parse(details.toString()) });
  } catch (err) {
    res.status(500).json({ error: `Submissions not found: ${err}` });
  }
};

export {
  fetchExam,
  scheduleExam,
  cancelExam,
  updateExam,
  deleteExam,
  fetchAnswerSheets,
};
