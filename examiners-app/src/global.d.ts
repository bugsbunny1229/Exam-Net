/// <reference types="svelte" />
interface Exam {
    Type?: "Exam";
    ID: string;
    Examiner: string;
    Title: string;
    Subject: string;
    Live: boolean;
    Date: string;
    Duration: number;
    Password: string;
    Address: string;
}

interface AnswerSheet {
    Type?: "AnswerSheet";
    ID: string;
    ExamID: string;
    RollNumber: string;
    Key: string;
    Address: string;
}

interface Result {
    Type?: "Result";
    ID: string;
    AnswerSheetID: string;
    ExamID: string;
    Examiner: string;
    RollNumber: string;
    Address: string;
    Signature: string;
}