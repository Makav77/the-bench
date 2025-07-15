import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../Users/entities/user.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @Column()
  room: string;

  @Column()
  type: 'general' | 'private' | 'group';

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, user => user.messages, { onDelete: 'CASCADE' })
  sender: User;
}
