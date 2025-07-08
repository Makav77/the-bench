import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../Users/entities/user.entity";

@Entity()
export class HangmanInvite {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, { eager: true })
  sender: User;

  @ManyToOne(() => User, { eager: true })
  recipient: User;

  @Column()
  status: "pending" | "accepted" | "declined";

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  guesserId?: string;

  @Column({ nullable: true })
  wordToGuess?: string;
}
