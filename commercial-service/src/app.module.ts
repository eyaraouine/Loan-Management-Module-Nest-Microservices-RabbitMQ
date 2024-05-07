/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientLoanInfos } from './entities/client-loan-infos.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [ TypeOrmModule.forRoot({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'dualipa2',
    database: 'loan_db',
    entities: [ClientLoanInfos],
    synchronize: true,
  }),TypeOrmModule.forFeature([ClientLoanInfos])],
  controllers: [AppController],
  providers: [AppService],

})
export class AppModule {}
