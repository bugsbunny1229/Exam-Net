import { writable, Writable } from "svelte/store";

export const answerSheetStore: Writable<AnswerSheet> = writable({
    ID: null,
    ExamID: null,
    Key: null,
    Address: null,
    RollNumber: null,
});