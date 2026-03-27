import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "_services" })
export class Service {
    @Column()
    public comment: string;

    @PrimaryColumn({ unique: true })
    public authKey: string;
}