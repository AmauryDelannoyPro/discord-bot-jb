#!/bin/bash

project_dir=discord-bot-jb-main
last_modified_file=".last_modified"
git_url=https://github.com/AmauryDelannoyPro/discord-bot-jb/archive/refs/heads/main.zip
path_env=../.dev.env
path_app=src/app/app.js
repo_api_url="https://api.github.com/repos/AmauryDelannoyPro/discord-bot-jb/commits/main"

# Fonction pour vérifier si une commande est disponible
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Vérification et installation de Node.js
if command_exists node; then
    echo "Node.js est déjà installé."
else
    echo "Node.js n'est pas installé. Installation en cours..."
    brew install node
fi

# Vérification et installation de Redis
if command_exists redis-server; then
    echo "Redis est déjà installé."
else
    echo "Redis n'est pas installé. Installation en cours..."
    brew install redis
fi

# Vérification si une nouvelle version du ZIP est disponible
echo "Vérification de la version du projet sur GitHub..."
last_commit=$(curl -s "$repo_api_url" | grep '"sha"' | head -n 1 | sed 's/.*"sha": "\(.*\)",/\1/')

if [ -f "$last_modified_file" ] && [ "$(cat $last_modified_file)" == "$last_commit" ]; then
    echo "Aucune nouvelle version disponible. Pas de téléchargement nécessaire."
else
    echo "Nouvelle version disponible. Téléchargement en cours..."

    rm -rf "$project_dir"
    rm -f .project.zip

    curl -L -o .project.zip "$git_url"

    echo "Extraction du projet..."
    unzip .project.zip
    rm -f .project.zip

    # Enregistrer la date de la dernière modification
    echo "$last_commit" > "$last_modified_file"
fi

cd $project_dir

echo ""

# Lancer redis-server en arrière-plan
echo "Lancement de Redis..."
redis-server & 

# Lancer l'application Node.js
echo "Lancement de l'application Node.js..."
npm install
node --env-file=$path_env $path_app
