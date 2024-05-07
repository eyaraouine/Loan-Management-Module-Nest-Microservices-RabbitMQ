/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';

import * as amqp from 'amqplib';
import { pdfToText } from 'pdf-ts';
import * as fs from 'fs/promises'; 






@Injectable()
export class AppService {

 
  async  startOCRService() {
    // Connexion à RabbitMQ
    const connection = await amqp.connect('amqp://localhost:5672');
    const channel = await connection.createChannel();
  
    // Création de la queue pour recevoir les requêtes de traitement
    const requestQueue = 'ProcessRequest_Queue';
    await channel.assertQueue(requestQueue, { durable: false });
  
    // Création de la queue pour envoyer les résultats du traitement OCR
    const processedQueue = 'OCRProcessed_Queue';
    await channel.assertQueue(processedQueue, { durable: false });
  
    // Écoute de la queue pour recevoir les requêtes de traitement
    channel.consume(requestQueue, async (msg) => {
      if (msg !== null) {
       // Récupération du chemin du fichier
       const filePathObj = JSON.parse(msg.content.toString());
       const filePath = filePathObj.filePath; // Chemin d'accès complet du fichier
      console.log("Message consumed from the queue ProcessRequest_Queue")
  
        // Traitement du fichier pour extraire les informations nécessaires
        const extractedData = await this.extractPDFInformation(filePath);
        console.log("Extracted loan informations:",extractedData);

  
        // Envoi des informations extraites dans la queue de résultats
        channel.sendToQueue(processedQueue, Buffer.from(JSON.stringify(extractedData)));
  
        // Acknowledge du message
        channel.ack(msg);
      }
    });
  }

 

async  extractPDFInformation(filePath: string): Promise<string> {
    try {
        const pdf = await fs.readFile(filePath);
        const text = await pdfToText(pdf);
        console.log("Extracting the client loan informations...")
         // Recherche des informations spécifiques avec des expressions régulières
         const lastNameRegex = /Nom\s*:\s*(\w+)/i;
         const firstNameRegex = /Prénom\s*:\s*(\w+)/i;
         const incomeRegex = /Revenu\s*:\s*(\d+)/i;
         const amountRegex = /Montant\s*:\s*(\d+)/i;
         const periodRegex = /Période de remboursement\s*:\s*(\d+)/i;
 
         const lastNameMatch = text.match(lastNameRegex);
         const firstNameMatch = text.match(firstNameRegex);
         const incomeMatch = text.match(incomeRegex);
         const amountMatch = text.match(amountRegex);
         const periodMatch = text.match(periodRegex);
 
         // Construction de l'objet d'informations extraites
         const extractedData: any = {};
         if (lastNameMatch) {
           extractedData.lastName = lastNameMatch[1];
         }
         if (firstNameMatch) {
           extractedData.firstName = firstNameMatch[1];
         }
         if (incomeMatch) {
           extractedData.income = parseInt(incomeMatch[1]);
         }
         if (amountMatch) {
           extractedData.amount = parseInt(amountMatch[1]);
         }
         if (periodMatch) {
           extractedData.period = parseInt(periodMatch[1]);
         }
 
        return extractedData;
    } catch (error) {
        console.error('Error occured when extracting infos from the PDF :', error);
        return '';
    }
}


 calculateEligibilityScore(clientInfo: any): number {
  let score = 0;

  // Vérifiez le revenu du client et attribuez des points en fonction du montant
  if (clientInfo.income >= 50000) {
    score += 50;
  } else if (clientInfo.income >= 30000 && clientInfo.income < 50000) {
    score += 30;
  } else if (clientInfo.income >= 20000 && clientInfo.income < 30000) {
    score += 20;
  }

  // Vérifiez le montant du prêt demandé et attribuez des points en fonction du montant
  if (clientInfo.montant >= 10000 && clientInfo.montant < 50000) {
    score += 30;
  } else if (clientInfo.montant >= 5000 && clientInfo.montant < 10000) {
    score += 20;
  } else if (clientInfo.montant < 5000) { // Montant faible
    // Augmenter le score si le revenu est élevé
    if (clientInfo.income >= 50000) {
      score += 20;
    } else if (clientInfo.income >= 30000 && clientInfo.income < 50000) {
      score += 10;
    }
  }

  // Vérifiez la période du prêt et attribuez des points en fonction de la période
  if (clientInfo.period >= 12) {
    score += 50;
  } else if (clientInfo.period >= 6 && clientInfo.period < 12) {
    score += 30;
  } else if (clientInfo.period >= 3 && clientInfo.period < 6) {
    score += 20;
  } else if (clientInfo.period < 3) { // Période faible
    // Augmenter le score si le revenu est élevé
    if (clientInfo.income >= 50000) {
      score += 20;
    } else if (clientInfo.income >= 30000 && clientInfo.income < 50000) {
      score += 10;
    }
  }

  return score;
}

}  
  
  
  


  


