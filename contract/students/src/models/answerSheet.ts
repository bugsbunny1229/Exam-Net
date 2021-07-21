import { Object, Property } from 'fabric-contract-api';

@Object()
export class AnswerSheet {
    @Property()
    public Type?: string = "AnswerSheet";

    @Property()
    public ID: string;

    @Property()
    public ExamID: string;

    @Property()
    public RollNumber: string;

    @Property()
    public Address: string;

    @Property()
    public Key: string;
}
