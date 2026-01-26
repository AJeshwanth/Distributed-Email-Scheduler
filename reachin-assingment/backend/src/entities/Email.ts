import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class Email {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  to!: string;

  @Column()
  subject!: string;

  @Column("text")
  body!: string;

  @Column()
  scheduledTime!: Date;

  @Column({ default: "scheduled" })
  status!: string;

  @Column({ nullable: true })
  userId!: number;

  @Column({ nullable: true })
  previewUrl!: string;


  @CreateDateColumn()
  createdAt!: Date;
}
