function formatUsersMessages(messagesByUsers) {
    const container = document.getElementById('dynamic-content');
    container.innerHTML = ''; // Réinitialiser le contenu précédent

    Object.keys(messagesByUsers).forEach(userId => {
        const user = messagesByUsers[userId].user;
        const messages = messagesByUsers[userId].messages;

        // Créer une section pour chaque utilisateur
        const userSection = document.createElement('div');
        userSection.className = 'user-section';

        // Créer un titre pour l'utilisateur
        const userTitle = document.createElement('h2');
        userTitle.textContent = `Utilisateur : ${user.name}`;
        userSection.appendChild(userTitle);

        // Créer une liste pour les messages de l'utilisateur
        const messageList = document.createElement('ul');
        messages.forEach(message => {
            const messageItem = document.createElement('li');
            const timestamp = new Date(message.timestamp).toLocaleString();
            messageItem.innerHTML = `<strong>${message.content}</strong><br> <small>Envoyé le ${timestamp}</small>`;
            messageList.appendChild(messageItem);
        });

        userSection.appendChild(messageList);
        container.appendChild(userSection);
    });
}

function loadDynamicContent() {
    fetch('/api/messages') 
        .then(response => {
            return response.json();
        })
        .then(data => {
            formatUsersMessages(data);
        })
        .catch(error => {
            console.error('Erreur:', error);
            document.getElementById('dynamic-content').textContent = 'Erreur lors du chargement des données.';
        });
}

// Charger les données dynamiques au chargement de la page
window.onload = loadDynamicContent;
