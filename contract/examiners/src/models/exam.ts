import { Object, Property } from 'fabric-contract-api';

@Object()
export class Exam {
    @Property()
    public ID: string;

    @Property()
    public Examiner: string;

    @Property()
    public Title: string;

    @Property()
    public Subject: string;

    @Property()
    public Live?: string = '0';

    @Property()
    public Date: string;

    @Property()
    public Duration: number;

    @Property()
    public Password: string;

    @Property()
    public Address: string;
}
