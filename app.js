const express = require('express')
const Discord = require('discord.js')
const utils = require("./src/js/utils")

const app = express()
const port = process.env.PORT; // debug 3000, prod 80

const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
  ]
});

const channelIds = process.env.CHANNELS_LISTENED.split(',');
const singleChannelListened = channelIds[0] //A retirer quand on aura un fetch d'une liste de channel

async function fetchMessages(channelId) {
  return client.channels.fetch(channelId)
    .then(channel => {
      return channel.messages.fetch({ limit: 10 }) // A retirer
        .then(messages => {
          let users_messages_map = {}
          messages.forEach(message => {
            if (message.author.bot) {
              return;
            }

            const userContent = {
              id: message.author.id,
              name: message.author.globalName,
            }
            const messageContent = {
              id: message.id,
              content: message.content,
              timestamp: utils.getMostRecentTimestamp(message.editedTimestamp, message.createdTimestamp)
            }

            users_messages_map = utils.addUserMessage(users_messages_map, userContent, messageContent)
          })
          return users_messages_map
        })
    })
    .catch(console.error);
}

function discordbot() {
  client.login(process.env.DISCORD_BOT_TOKEN)
  client.once("ready", () => {
    webserver()
  });

  // #region events
  // Récup des nouveaux event liés aux messages (création, modification, suppression)
  client.on("messageCreate", (message) => {
    console.log("onMessageCreate", message.content)
  })

  client.on("messageUpdate", (oldMessage, newMessage) => {
    const msg = "'" + oldMessage.content + "' devient '" + newMessage.content + "'"
    console.log("onMessageUpdate", msg)
  })

  client.on("messageDelete", (message) => {
    console.log("onMessageDelete", message.content)
  })

  client.on("error", (err) => {
    console.err(err)
  })
  // #endregion
}



function postMessageOnDiscord(message) {
  client.channels.fetch(singleChannelListened) //TODO ADEL
    .then(channel => {
      channel.send(message)
        .then(() => {
          utils.log("Message posté")
        })
    })
    .catch(console.error)
}


function webserver() {
  app.use(express.static('public'));
  app.use(express.json());

  app.get('/api/messages', (req, res) => {
    fetchMessages(singleChannelListened) //TODO ADEL
      .then(data => {
        res.json(data);
      })
      .catch(console.error);
  });


  // Route pour recevoir et loguer le message
  app.post('/api/send-message', (req, res) => {
    const message = req.body.message;
    res.json({ status: 'Message reçu' });
    postMessageOnDiscord(message)
  });


  app.listen(port, () => {
    console.log(`Server start on port ${port}`)
  })
}

discordbot()