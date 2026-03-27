import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity({ name: "_description_files" })
export default class DescriptionFile {
    @Column()
    public content: string;

    @PrimaryColumn({ unique: true })
    public name: string;
}