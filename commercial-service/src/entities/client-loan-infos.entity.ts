/* eslint-disable prettier/prettier */


import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ClientLoanInfos {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  lastName: string;

  @Column()
  firstName: string;

  @Column({ type: 'int', nullable: true })
  income: number;

  @Column({ type: 'int', nullable: true })
  amount: number;

  @Column({ type: 'int', nullable: true })
  period: number;
  
  @Column({ type: 'int', nullable: true })
  eligibility: number;
}
