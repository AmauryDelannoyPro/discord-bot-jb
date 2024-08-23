const express = require('express')
const repo = require("./src/js/dataRepository")
const app = express()
const port = process.env.PORT;

async function webserver() {
  app.use(express.static('public'));
  app.use(express.json());

  await repo.init()

  app.listen(port, () => {
    console.log(`Server start on port ${port}`)
  })


  // Route pour récupérer la liste des utilisateurs
  app.get('/api/get-users', (req, res) => {
    repo.getUsersByRecentMessages(true) // prévoir option pour inverser l'ordre
      .then(data => {
        res.json(data);
      })
      .catch(console.error);
  });


  // Route pour récupérer la liste des messages utilisateur
  app.get('/api/get-user-messages', (req, res) => {
    repo.getUserMessages(req.query.userId)
      .then(data => {
        res.json(data);
      })
      .catch(console.error);
  });


  // Route pour recevoir et loguer le message
  app.post('/api/send-message', (req, res) => {
    const evaluationInfo = req.body;
    //TODO ADEL renvoyer le message posté sur Discord + refresh vue pour virer formulaire et mettre a la place le message discord
    res.json({ status: 'Message reçu' });

    repo.replyMessageOnDiscord(evaluationInfo.channelId, evaluationInfo.evaluationForm, evaluationInfo.messageId)
  });
}

webserver()

// TODO ADEL Si besoin d'améliorer le cache, regarder ici https://medium.com/@yurii.h.dev/nodejs-redis-how-and-why-88647af49e99