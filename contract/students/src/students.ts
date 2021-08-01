import {
    Context,
    Contract,
    Info,
    Returns,
    Transaction,
} from "fabric-contract-api";
import { AnswerSheet } from "./models/answerSheet";
import { Exam } from "./models/exam";
import { Result } from "./models/result";

@Info({
    title: "StudentContract",
    description: "Smart contract for students' channel",
})
export class StudentContract extends Contract {
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
        examinerKey: string,
    ): Promise<void> {
        const exam: Exam = {
            Type: "Exam",
            ID: id,
            Examiner: examiner,
            Title: title,
            Subject: subject,
            Date: date,
            Duration: duration,
            Password: password,
            Address: address,
            ExaminerKey: examinerKey,
        };
        if (ctx.clientIdentity.getMSPID() === "ExaminersMSP") {
            await ctx.stub.putState(id, Buffer.from(JSON.stringify(exam)));
        } else {
            throw new Error(
                "Only examiners are allowed to perform this action"
            );
        }
    }

    @Transaction(false)
    @Returns("string")
    public async FetchExam(ctx: Context, id: string): Promise<string> {
        const entity = await ctx.stub.getState(id);
        if (!entity || entity.length === 0) {
            throw new Error(`The exam ${id} does not exist`);
        }

        const exam: Exam = JSON.parse(entity.toString());
        if (exam.Type === "Exam") {
            return JSON.stringify(exam);
        }
        throw new Error(`Entity with ID ${id} is not an exam`);
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
                "You are not the examiner for this exam"
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
            if (record.Type === "Exam")
                allResults.push({ ID: result.value.key, Exam: record });
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    @Transaction()
    public async SubmitExam(ctx: Context, id: string, examId: string, address: string, key: string): Promise<void> {
        if (ctx.clientIdentity.getMSPID() === "StudentsMSP") {
            const examString = await this.FetchExam(ctx, examId);
            const exam: Exam = JSON.parse(examString);
            const deadline = (new Date(exam.Date)).getTime() + exam.Duration * 60000;
            const rollNumber = ctx.clientIdentity.getAttributeValue("RollNumber");
            if (Date.now() <= deadline) {
                const indexName = "examID~Roll~ID";
                const answerSheetIterator = await ctx.stub.getStateByPartialCompositeKey(indexName, [examId, rollNumber]);
                let results = await answerSheetIterator.next();
                if (results.done) {
                    const answerSheet: AnswerSheet = {
                        Type: "AnswerSheet",
                        ID: id,
                        ExamID: examId,
                        Address: address,
                        Key: key,
                        RollNumber: rollNumber
                    }
                    await ctx.stub.putState(id, Buffer.from(JSON.stringify(answerSheet)));
                    const indexKey = ctx.stub.createCompositeKey(indexName, [examId, rollNumber, id]);
                    await ctx.stub.putState(indexKey, Buffer.from('\u0000'));
                } else {
                    throw new Error("You have already submitted an answer sheet for this Exam");
                }
            } else {
                throw new Error("The time for submissions has ended");
            }
        } else {
            throw new Error(
                "Only students are allowed to perform this action"
            );
        }
    }

    private async GetAnswerSheetByID(ctx: Context, id: string): Promise<string> {
        const entity = await ctx.stub.getState(id);
        if (!entity || entity.length === 0) {
            throw new Error(`The answer sheet ${id} does not exist`);
        }
        const answerSheet: AnswerSheet = JSON.parse(entity.toString());
        if (answerSheet.Type === "AnswerSheet") {
            return JSON.stringify(answerSheet);
        }
        throw new Error(`Entity with ID ${id} is not an answer sheet`);
    }

    @Transaction(false)
    @Returns("string")
    public async GetAnswerSheets(ctx: Context, examId: string): Promise<string> {
        const examString = await this.FetchExam(ctx, examId);
        const exam: Exam = JSON.parse(examString);
        const email = ctx.clientIdentity.getAttributeValue("Email");
        if (email == exam.Examiner) {
            const answerSheetIterator = await ctx.stub.getStateByPartialCompositeKey("examID~Roll~ID", [examId]);
            const answerSheets = [];
            let results = await answerSheetIterator.next();
            while (!results.done) {
                if (!results || !results.value || !results.value.key) {
                    return;
                }
                let answerSheetId = ctx.stub.splitCompositeKey(results.value.key).attributes[2];
                const answerSheetString = await this.GetAnswerSheetByID(ctx, answerSheetId);
                answerSheets.push(JSON.parse(answerSheetString));
                results = await answerSheetIterator.next();
            }
            return JSON.stringify(answerSheets);
        } else {
            throw new Error('You are not the Examiner for this Exam');
        }
    }

    @Transaction()
    public async PublishResult(ctx: Context, id: string, answerSheetId: string, address: string, signature: string): Promise<void> {
        const answerSheetString = await this.GetAnswerSheetByID(ctx, answerSheetId);
        const answerSheet: AnswerSheet = JSON.parse(answerSheetString);
        const examString = await this.FetchExam(ctx, answerSheet.ExamID);
        const exam: Exam = JSON.parse(examString);
        const email = ctx.clientIdentity.getAttributeValue("Email");
        if (email == exam.Examiner) {
            const indexName = "examId~answerSheetId~ID";
            const answerSheetIterator = await ctx.stub.getStateByPartialCompositeKey(indexName, [answerSheet.ExamID, answerSheetId]);
            let results = await answerSheetIterator.next();
            if (results.done) {
                const result: Result = {
                    Type: "Result",
                    ID: id,
                    AnswerSheetID: answerSheetId,
                    ExamID: answerSheet.ExamID,
                    RollNumber: answerSheet.RollNumber,
                    Examiner: email,
                    Address: address,
                    Signature: signature
                }
                await ctx.stub.putState(id, Buffer.from(JSON.stringify(result)));
                const indexKey = ctx.stub.createCompositeKey(indexName, [answerSheet.ExamID, answerSheetId, id]);
                await ctx.stub.putState(indexKey, Buffer.from('\u0000'));
            } else {
                throw new Error("You have already published the result for this answer sheet");
            }
        } else {
            throw new Error(
                "You are not the examiner for this exam"
            );
        }
    }

    private async GetResultByID(ctx: Context, id: string): Promise<string> {
        const entity = await ctx.stub.getState(id);
        if (!entity || entity.length === 0) {
            throw new Error(`The result ${id} does not exist`);
        }
        const result: Result = JSON.parse(entity.toString());
        if (result.Type === "Result") {
            return JSON.stringify(result);
        }
        throw new Error(`Entity with ID ${id} is not a result`);
    }

    @Transaction(false)
    @Returns("string")
    public async FetchResultsByExam(ctx: Context, examId: string): Promise<string> {
        const indexName = "examId~answerSheetId~ID";
        const examString = await this.FetchExam(ctx, examId);
        const exam: Exam = JSON.parse(examString);
        const email = ctx.clientIdentity.getAttributeValue("Email");
        if (email == exam.Examiner) {
            const resultsIterator = await ctx.stub.getStateByPartialCompositeKey(indexName, [examId]);
            const results = [];
            let it = await resultsIterator.next();
            while (!it.done) {
                if (!it || !it.value || !it.value.key) {
                    return;
                }
                let resultId = ctx.stub.splitCompositeKey(it.value.key).attributes[2];
                const answerSheetString = await this.GetResultByID(ctx, resultId);
                results.push(JSON.parse(answerSheetString));
                it = await resultsIterator.next();
            }
            return JSON.stringify(results);
        } else {
            throw new Error("You are not the examiner for this exam");
        }
    }

    private async FetchResultForAnswerSheet(ctx: Context, answerSheetId: string): Promise<string> {
        const indexName = "examId~answerSheetId~ID";
        const answerSheetString = await this.GetAnswerSheetByID(ctx, answerSheetId);
        const answerSheet: AnswerSheet = JSON.parse(answerSheetString);
        const rollNumber = ctx.clientIdentity.getAttributeValue("RollNumber");
        if (rollNumber == answerSheet.RollNumber) {
            const resultsIterator = await ctx.stub.getStateByPartialCompositeKey(indexName, [answerSheet.ExamID, answerSheetId]);
            let it = await resultsIterator.next();
            if (!it.done) {
                if (!it || !it.value || !it.value.key) {
                    return;
                }
                let resultId = ctx.stub.splitCompositeKey(it.value.key).attributes[2];
                return this.GetResultByID(ctx, resultId);
            } else {
                throw new Error("Results have not yet been published for this answer sheet");
            }
        } else {
            throw new Error("You are not the owner of this answer sheet");
        }
    }

    @Transaction(false)
    @Returns("string")
    public async GetResult(ctx: Context, examId: string): Promise<string> {
        const rollNumber = ctx.clientIdentity.getAttributeValue("RollNumber");
        const answerSheetIterator = await ctx.stub.getStateByPartialCompositeKey("examID~Roll~ID", [examId, rollNumber]);
        let results = await answerSheetIterator.next();
        if (!results.done) {
            if (!results || !results.value || !results.value.key) {
                throw new Error('No submission found');
            }
            let answerSheetId = ctx.stub.splitCompositeKey(results.value.key).attributes[2];
            return this.FetchResultForAnswerSheet(ctx, answerSheetId);
        } else {
            throw new Error('No submission found');
        }
    }
}
