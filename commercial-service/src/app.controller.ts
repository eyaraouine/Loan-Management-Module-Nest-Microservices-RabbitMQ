/* eslint-disable prettier/prettier */
import { Body, Controller,  Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('process')
export class AppController {
  constructor(private readonly appService: AppService) {}

 
  @Post() // Changez cette annotation pour @Post pour gérer les requêtes POST
  async processLoan(@Body() body: { filePath: string }): Promise<any> {
    try {
      // Extraire le chemin du fichier du corps de la requête
      const filePath = body.filePath;
        // Faites quelque chose avec le chemin du fichier...
      console.log('File path received from the API Gateway', filePath);
      await this.appService.processLoan(filePath);

}catch (error) {
  console.error('Error occured when processing the received file', error);
  // Gérer les erreurs et renvoyer une réponse appropriée en cas d'échec
  throw new Error('Error occured when processing the received file');
}

  }
}