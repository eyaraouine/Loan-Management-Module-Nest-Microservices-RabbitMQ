const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

const app = express();
const port = 3001;

// Configuration de multer pour gérer les fichiers envoyés dans les demandes POST
const upload = multer({
  dest: '../uploads/' // Dossier où les fichiers seront temporairement stockés
});

// Middleware pour parser les données de requête
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Endpoint pour recevoir les demandes de formulaire de prêt
app.post('/loan', upload.single('loanApplication'), async (req, res) => {
  try {
    // Récupérer le fichier de la demande de prêt
    const loanApplicationFile = req.file;

    // Vérifier si un fichier a été envoyé
    if (!loanApplicationFile) {
      return res.status(400).json({ error: 'No file sent' });
    }

    // Définir le chemin du répertoire d'uploads
    const uploadsDir = path.join(__dirname, '..', 'uploads');

    // Assurez-vous que le répertoire d'uploads existe, sinon créez-le
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }

    // Générer un nom de fichier unique pour éviter les collisions
    const fileName = `${Date.now()}_${loanApplicationFile.originalname}`;
    
    // Définir le chemin complet du fichier
    const filePath = path.join(uploadsDir, fileName);

    // Déplacer le fichier téléchargé vers le répertoire d'uploads
    await fs.promises.rename(loanApplicationFile.path, filePath);

    // Faire quelque chose avec le fichier...
    console.log('Loan application document received:', fileName);

    // Envoyer le chemin du fichier local au microservice de traitement des prêts
    const response = await axios.post('http://localhost:3002/process', {
      filePath: filePath
    });
    


    // Répondre au client avec la réponse du service de traitement des prêts
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error occured when receiving the loan application file :', error);
    res.status(500).json({ error: 'Error occured when receiving the loan application file' });
  }
});

// Endpoint pour recevoir les demandes des documents de contrat de credit( cette fonctionalité est non implementée)
//app.post('/credit',)

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Server API Gateway listening on port ${port}`);
});
