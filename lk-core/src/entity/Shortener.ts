import { Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "_shortener" })
export default class Shortener {
    @PrimaryColumn({ unique: true })
    public short: string;

    @PrimaryColumn({ unique: true })
    public target: string;
}