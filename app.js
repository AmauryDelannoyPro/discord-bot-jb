const express = require('express')
const path = require('path')
const Discord = require('discord.js')
const config = require("./conf")
const utils = require("./src/js/utils")

const app = express()
const port = 3000 // debug 3000, prod 80

const client = new Discord.Client({ intents: 34304 })  //274877983808
const channelIds = ["1262684763085475860"]


function discordbot() {
  client.login(config.token)
  client.once("ready", () => {
    // Récupération des messages passés
    client.channels.fetch('1262684763085475860') //channel "bot-jb" //TODO ADEL passer liste de channel
      .then(channel => {
        channel.messages.fetch({ limit: 5 })
          .then(messages => {
            // utils.log(messages);

            // #region format-message-info
            var users_messages_map = {}
            messages.forEach(message => {
              // TODO a voir si on passe par des class
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
            utils.log(users_messages_map);
            // #endregion

          })
          .catch(console.error);
      })
      .catch(console.error);
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

  // Load resources files
  // app.use(express.static('res')) #syntaxe de base, avec chemin relatif
  app.use('/res', express.static(path.join(__dirname, 'res'))) // #chemin absolu

  app.get('/', (req, res) => {
    res.send('Hello World!')
  })

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
}

discordbot()
webserver()