import {
    Context,
    Contract,
    Info,
    Returns,
    Transaction,
} from "fabric-contract-api";
import { Exam } from "./models/exam";

@Info({
    title: "ExamContract",
    description: "Smart contract for creating/updating/cancelling exams",
})
export class ExamContract extends Contract {
    @Transaction()
    public async CreateExam(
        ctx: Context,
        id: string,
        examiner: string,
        title: string,
        subject: string,
        date: string,
        duration: number,
        password: string,
        address: string,
        live: string = "0",
        examinerKey: string,
    ): Promise<void> {
        const exam: Exam = {
            ID: id,
            Examiner: examiner,
            Title: title,
            Subject: subject,
            Date: date,
            Duration: duration,
            Password: password,
            Address: address,
            Live: live,
            ExaminerKey: examinerKey,
        };
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(exam)));
    }

    @Transaction(false)
    @Returns("string")
    public async FetchExam(ctx: Context, id: string): Promise<string> {
        const exam = await ctx.stub.getState(id);
        if (!exam || exam.length === 0) {
            throw new Error(`The exam ${id} does not exist`);
        }
        return exam.toString();
    }

    // UpdateAsset updates an existing asset in the world state with provided parameters.
    @Transaction()
    public async UpdateExam(
        ctx: Context,
        id: string,
        examiner: string,
        title: string,
        subject: string,
        date: string,
        duration: number,
        password: string,
        address: string,
        live: string = "0",
        examinerKey: string,
    ): Promise<void> {
        const examString = await this.FetchExam(ctx, id);
        const exam: Exam = JSON.parse(examString);
        if (exam.Live === "0") {
            if (ctx.clientIdentity.assertAttributeValue("Email", examiner)) {
                const updatedExam: Exam = {
                    ID: id,
                    Examiner: examiner,
                    Title: title,
                    Subject: subject,
                    Date: date,
                    Duration: duration,
                    Password: password,
                    Address: address,
                    Live: live,
                    ExaminerKey: examinerKey,
                };
                return ctx.stub.putState(
                    id,
                    Buffer.from(JSON.stringify(updatedExam))
                );
            } else {
                throw new Error(
                    "You are not the examiner for this exam"
                );
            }
        } else {
            throw new Error("Cannot update an Exam while it is Live. Please cancel the Exam first.");
        }
    }

    @Transaction()
    public async ScheduleExam(ctx: Context, id: string): Promise<void> {
        const examString: string = await this.FetchExam(ctx, id);
        const exam: Exam = JSON.parse(examString);
        await this.UpdateExam(
            ctx,
            id,
            exam.Examiner,
            exam.Title,
            exam.Subject,
            exam.Date,
            exam.Duration,
            exam.Password,
            exam.Address,
            "1",
            exam.ExaminerKey,
        );
    }

    @Transaction()
    public async CancelExam(ctx: Context, id: string): Promise<void> {
        const examString: string = await this.FetchExam(ctx, id);
        const exam: Exam = JSON.parse(examString);
        if (ctx.clientIdentity.assertAttributeValue("Email", exam.Examiner)) {
            exam.Live = '0';
            return ctx.stub.putState(
                id,
                Buffer.from(JSON.stringify(exam))
            );
        } else {
            throw new Error(
                "You are not the examiner for this exam"
            );
        }
    }

    // DeleteAsset deletes an given asset from the world state.
    @Transaction()
    public async DeleteExam(ctx: Context, id: string): Promise<void> {
        const examString: string = await this.FetchExam(ctx, id);
        const exam: Exam = JSON.parse(examString);
        if (ctx.clientIdentity.assertAttributeValue("Email", exam.Examiner)) {
            return ctx.stub.deleteState(id);
        } else {
            throw new Error(
                `You are not the examiner for this exam: ${ctx.clientIdentity.getAttributeValue(
                    "Email"
                )} ${exam.Examiner}`
            );
        }
    }

    // GetAllAssets returns all assets found in the world state.
    @Transaction(false)
    @Returns("string")
    public async GetAllExams(ctx: Context): Promise<string> {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all exams in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange("", "");
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(
                result.value.value.toString()
            ).toString("utf8");
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ ID: result.value.key, Exam: record });
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}
