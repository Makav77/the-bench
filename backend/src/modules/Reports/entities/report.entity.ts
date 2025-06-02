import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "src/modules/Users/entities/user.entity";

export type ReportStatus = "PENDING" | "VALIDATED" | "REJECTED";

@Entity("reports")
export class Report {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "text" })
    reason: string;

    @Column({ type: "text", nullable: true })
    description: string | null;

    @Column({ type: "text", default: "PENDING" })
    status: ReportStatus;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @ManyToOne(() => User, (user) => user.reportsMade, { onDelete: "CASCADE" })
    reporter: User;

    @ManyToOne(() => User, (user) => user.reportsReceived, { onDelete: "CASCADE" })
    reportedUser: User;
}
