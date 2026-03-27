import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "contacts" })
export class Contacts {
    @PrimaryColumn({ unique: true })
    public userId: string;

    @PrimaryColumn({ unique: true })
    public roleId: string;
    
    @Column()
    public modifiedAt: Date;

    @Column()
    public phone?: string;
	
    @Column()
    public address?: string;

    @Column()
    public availableForSearch: boolean;

    @Column()
    public extraEmail?: string;

    @Column()
    public createdAt: Date;
}