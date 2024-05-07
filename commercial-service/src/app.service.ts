/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';
import { ClientLoanInfos } from './entities/client-loan-infos.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AppService {
  constructor(
  @InjectRepository(ClientLoanInfos)
  private clientInfosRepository: Repository<ClientLoanInfos>,
) {}
  



async  processLoan(filePath: string): Promise<any> {
  // Connexion à RabbitMQ
  const connection = await amqp.connect('amqp://localhost:5672');
  const channel = await connection.createChannel();
    // Création de la queue pour la requete
    const requestQueue = await channel.assertQueue('ProcessRequest_Queue', { durable: false });

  // Création de la queue pour la réponse
  const replyQueue = await channel.assertQueue('OCRProcessed_Queue', { durable: false });
    // Configuration de la file de réponse pour recevoir la réponse
    const correlationId = this.generateUuid();

    // Envoi du message à la queue
    const message = { filePath };
    channel.sendToQueue(requestQueue.queue, Buffer.from(JSON.stringify(message)), {
      correlationId: correlationId,
      replyTo: replyQueue.queue
    });
    console.log('Process request from the Commercial Service sent to the queue ProcessRequest_Queue');

//Reception des informations extraItes par le service OCR
  channel.consume(replyQueue.queue, (msg) => {

    const clientInfos = JSON.parse(msg.content.toString()); 

    console.log("Request response received from the OCR Service in the Queue OCRProcessed_Queue", clientInfos);
   
    console.log('Calculating eligibility score....');

    const score = this.calculateEligibilityScore(clientInfos);
    clientInfos.eligibility = score;
    console.log('The eligiblity score for this client is :',score);
    if(score >= 70 ){
      console.log('The client is eligible');
     
    }else{
      console.log('The client is not eligible');
    }
    console.log('Sending the evaluation result to the queue EligibilityStatus_Queue...(NOT IMPLEMENTED)');
    console.log('Storing the evaluation result in the database... ')
    this.saveClientInfoToDatabase(clientInfos);
  
      // Fermeture de la connexion
      setTimeout(() => {
        connection.close();
      }, 500);
    
  }, { noAck: true });
}

// Fonction utilitaire pour générer un identifiant unique
 generateUuid() {
  return Math.random().toString() +
         Math.random().toString() +
         Math.random().toString();
}

 calculateEligibilityScore(clientInfo: any): number {
  let score = 0;

  // Vérifiez le revenu du client et attribuez des points en fonction du montant
  if (clientInfo.income >= 50000) {
    score += 50;
  } else if (clientInfo.income >= 30000 && clientInfo.income < 50000) {
    score += 30;
  } else if (clientInfo.income < 30000) {
    score += 20;
  }
  // Vérifiez le montant du prêt demandé et attribuez des points en fonction du montant
  if (clientInfo.montant >= 10000 && clientInfo.montant < 50000) {
    score += 30;
  } else if (clientInfo.montant < 10000) {
    score += 20;
  } 
  // Vérifiez la période du prêt et attribuez des points en fonction de la période
  if (clientInfo.period >= 12) {
    score += 20;
  } else if (clientInfo.period >= 6 && clientInfo.period < 12) {
    score += 30;
  } else if (clientInfo.period < 6) {
    score += 50;
  }

  return score;
}


async saveClientInfoToDatabase(data: ClientLoanInfos): Promise<void> {
  const clientInfoEntity = new ClientLoanInfos();
  clientInfoEntity.lastName = data.lastName; 
  clientInfoEntity.firstName = data.firstName; 
  clientInfoEntity.income = data.income;
  clientInfoEntity.amount = data.amount; 
  clientInfoEntity.period = data.period; 
  clientInfoEntity.eligibility = data.eligibility; 

  await this.clientInfosRepository.save(clientInfoEntity);
  console.log('Client informations saved successfully in the database')
}

}
