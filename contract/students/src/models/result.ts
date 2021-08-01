import { Object, Property } from 'fabric-contract-api';

@Object()
export class Result {
    @Property()
    public Type?: string = "Result";

    @Property()
    public ID: string;

    @Property()
    public AnswerSheetID: string;

    @Property()
    public ExamID: string;

    @Property()
    public Examiner: string;

    @Property()
    public RollNumber: string;

    @Property()
    public Address: string;

    @Property()
    public Signature: string;
}