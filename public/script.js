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

function postMessage() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value;
    console.log("on va envoyer: ", message)

    fetch('/api/send-message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: message })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Message envoyé:', data);
        messageInput.value = ''; 
    })
    .catch(error => {
        console.error('Erreur lors de l\'envoi du message:', error);
    });
}

// Charger les données dynamiques au chargement de la page
window.onload = loadDynamicContent;

// Ajouter un écouteur d'événements au bouton d'envoi
document.getElementById('send-button').addEventListener('click', postMessage);