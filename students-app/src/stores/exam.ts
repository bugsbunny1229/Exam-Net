import { writable, Writable } from "svelte/store";

export const examStore: Writable<Exam> = writable({
    ID: null,
    Examiner: null,
    Address: null,
    Live: false,
    Title: null,
    Subject: null,
    Date: null,
    Duration: null,
    Password: null,
    ExaminerKey: null,
});