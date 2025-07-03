# MyApp – Bot Discord avec Node.js et Redis

Cette application est un bot Discord utilisant `Node.js`, `Redis` et la bibliothèque `discord.js`. Elle interagit avec un serveur Discord selon des règles définies, et peut également échanger des données via Redis.

---

## 📦 Installation avec docker

Créer le fichier src/conf/.docker.env en vous basant sur src/conf/.template.env. (cf section "Clé de configuration" ci-dessous) 

La variable REDIS_URL doit prendre la valeur "redis"

Lancer la commande
```
docker compose up --build
```

## 📦 Installation locale sans docker

Assurez-vous d'avoir les outils suivants installés :

- [Node.js](https://nodejs.org/) (v18+ recommandé)  
- [Redis](https://redis.io/)  
- [npm](https://www.npmjs.com/), livré avec Node.js

---

Créer le fichier src/conf/.fichier_conf.env en vous basant sur src/conf/.template.env (cf section "Clé de configuration" ci-dessous)

Pour lancer le bot et l'interface web, on peut passer par la commande : 
```
node --env-file=src/conf/.fichier_conf.env src/app/app.js
```

En prérequis, il faut aussi penser à lancer le serveur redis qui sert de base de données. Pour ce faire, on peut faire la commande :
```
redis-server
```

## Clé de configuration (fichier .env)

| Clé                |                Description                 |
| ------------------ | :----------------------------------------: |
| DISCORD_SERVER_ID       |                Identifiant unique du serveur Discord                |
| CHANNELS_LISTENED |          Liste des identifiants des salons, **séparés par une virgule**, dans lesquels le bot va aller récupérer les messages           |
| FORMULAIRE_CRITERES       |          Liste des critères, **séparés par une virgule**, qui apparaîtront dans le formulaire de saisie sur le site, et qui seront postés tel quel en message.           |
| DISCORD_BOT_TOKEN    |        Identifiant unique du bot        |
| PORT   | Port d'écoute du serveur |
| DISCORD_BOT_NAME      |               Nom du bot                |
| REDIS_URL    |   URL du serveur Redis    |
| REDIS_PORT    |   Port du serveur Redis    |
---
