const express = require('express')
const path = require('path')
const Discord = require('discord.js')
const config = require("./conf")
const utils = require("./src/js/utils")

const app = express()
const port = 3000 // debug 3000, prod 80

const client = new Discord.Client({ intents: 34304 })  //274877983808
const channelIds = ["1262684763085475860"]

function fetchMessages() {
  return client.channels.fetch('1262684763085475860') //channel "bot-jb" //TODO ADEL passer liste de channel
    .then(channel => {
      return channel.messages.fetch({ limit: 5 })
        .then(messages => {
          var users_messages_map = {}
          messages.forEach(message => {
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
  client.login(config.token)
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



function webserver() {
  app.use(express.static('public'));

  app.get('/api/messages', (req, res) => {
    fetchMessages()
      .then(data => {
        res.json(data); 
      })
      .catch(console.error);
  });

  app.listen(port, () => {
    console.log(`App listening on port ${port}`)
  })
}

discordbot()