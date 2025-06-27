# MyApp – Bot Discord avec Node.js et Redis

Cette application est un bot Discord utilisant `Node.js`, `Redis` et la bibliothèque `discord.js`. Elle interagit avec un serveur Discord selon des règles définies, et peut également échanger des données via Redis.

---

## 📦 Prérequis

Assurez-vous d'avoir les outils suivants installés :

- [Node.js](https://nodejs.org/) (v18+ recommandé)  
- [Redis](https://redis.io/)  
- [npm](https://www.npmjs.com/), livré avec Node.js

---

Pour lancer le bot et l'interface web, on peut passer par la commande : 
```
node --env-file=src/conf/.fichier_conf.env src/app/app.js
```

En prérequis, il faut aussi penser à lancer le serveur redis qui sert de base de données. Pour ce faire, on peut faire la commande :
```
redis-server
```
