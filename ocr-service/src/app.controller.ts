/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
    this.listenForRequests();
  }


  async listenForRequests(): Promise<void> {
    try {
      // Démarrer le service OCR pour écouter les requêtes de traitement
      await this.appService.startOCRService();
    } catch (error) {
      console.error('Error occured when starting the OCR Service:', error);
      // Gérer les erreurs éventuelles
    }
  }
}
