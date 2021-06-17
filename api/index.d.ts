import { Contract } from 'fabric-network';

interface Exam {
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

interface Locals {
    contract?: Contract;
    studentContract?: Contract;
    exam?: Exam;
}

declare module 'express' {
    export interface Response {
        locals: Locals;
    }
}
