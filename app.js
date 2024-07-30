const express = require('express')
const path = require('path')
const Discord = require('discord.js')
const config = require("./conf")

const app = express()
const port = 3000 // debug 3000, prod 80

const client = new Discord.Client({ intents: 34304 })  //274877983808
const channelIds = ["1262684763085475860"]


function discordbot() {
  client.login(config.token)
  client.once("ready", () => {
    console.log("ok")

    // Récupération des messages passés
    client.channels.fetch('1262684763085475860') //channel "bot-jb" //TODO ADEL passer liste de channel
      .then((channel) => {
        channel.messages.fetch()
          .then(messages => {
            var msg = messages.filter(message => {
              return message.content.includes("test modif")
            })
            console.log("filter", msg)
          })
          .catch(console.error);
      })
      .catch(console.error);
  });

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