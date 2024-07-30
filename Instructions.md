J'ai créé un bot ici https://discord.com/developers/applications
Je l'ai mis GuildMember (dédié a un serveur spécifique apparemment)
En Authorisation, allez voir les screens permissions*.png
Dans l'onglet "Installation" j'ai coché que Guild Install
Dans OAuth2, j'ai rien mis
Dans Bot, j'ai mis public (pck j'arrive pas a mettre privé ^^"),
    désactivé "Require OAuth2 code grant"
    Coché "Message intent", je sais pas ce que c'est mais ça sonne bien


DEV :
La base, qui permet de démarrer le bot (statut "En ligne" sur le serveur) : 
```js
const Discord = require('discord.js')
const bot = new Discord.Client({intents: 34304}) // Intent calculé via https://discord-intents-calculator.vercel.app/
bot.login("my app token")
```