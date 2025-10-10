const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(cors()); // Permet à l'API de répondre aux requêtes depuis ton frontend

// Fichier JSON contenant les domaines en location
const domainsFile = 'domains.json';

// Vérifier si le domaine est en location
app.get('/check-domain', (req, res) => {
    const { domain } = req.query;

    if (!domain) {
        return res.status(400).json({ error: 'Domaine manquant' });
    }

    fs.readFile(domainsFile, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur de lecture du fichier des domaines' });
        }

        const domains = JSON.parse(data);
        const isRented = domains.includes(domain.toLowerCase()); // On compare en minuscule

        res.json({ isRented });
    });
});

app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});
