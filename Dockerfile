# Étape 1 : Utiliser une image Node.js officielle
FROM node:22.8.0

# Étape 2 : Créer un répertoire pour l'application dans le conteneur
WORKDIR /app

# Étape 3 : Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Étape 4 : Installer les dépendances
RUN npm install

# Étape 5 : Copier le reste du code de l'application
COPY . .

# Étape 6 : Exposer le port utilisé par l'application (si elle écoute sur un port spécifique, ex: 3000)
EXPOSE 3000

# Étape 7 : Démarrer l'application en utilisant la commande spécifiée
#CMD ["node", "--env-file=src/conf/.dev.env", "src/app/app.js"]
CMD ["node", "src/app/app.js"]
