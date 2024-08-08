function postMessage() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value;

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
            messageInput.value = '';
        })
        .catch(error => {
            console.error('Erreur lors de l\'envoi du message:', error);
        });
}

// #region users
function loadUsersContent() {
    fetch('/api/get-users')
        .then(response => {
            return response.json();
        })
        .then(data => {
            formatUsersInfo(data);
        })
        .catch(error => {
            console.error('Erreur:', error);
            document.getElementById('list-user-content').textContent = 'Erreur lors du chargement des données.';
        });
}

function formatUsersInfo(users) {
    const container = document.getElementById('list-user-content');
    container.innerHTML = '';

    const userList = document.createElement('ul');
    users.forEach(user => {
        const userItem = document.createElement('li');
        userItem.innerHTML = `<a href="#" onclick="loadUserMessagesContent('${user.id}')">Nom : ${user.name}</a>`;
        userList.appendChild(userItem);
    });
    container.appendChild(userList);
}
// #endregion

// #region user message
function loadUserMessagesContent(userId) {
    fetch(`/api/get-user-messages?userId=${userId}`)
        .then(response => {
            return response.json();
        })
        .then(data => {
            formatUserMessagesInfo(data);
        })
        .catch(error => {
            console.error('Erreur:', error);
            document.getElementById('user-messages-content').textContent = 'Erreur lors du chargement des données.';
        });
}

function formatUserMessagesInfo(messages) {
    const container = document.getElementById('user-messages-content');
    container.innerHTML = '';

    const userList = document.createElement('ul');
    messages.forEach(message => {
        const userItem = document.createElement('li');
        userItem.innerHTML = `Message : ${message.content}`;
        userList.appendChild(userItem);
    });
    container.appendChild(userList);
}
// #endregion

function initView() {
    loadUsersContent()
}

// Charger les données dynamiques au chargement de la page
window.onload = initView;

// Ajouter un écouteur d'événements au bouton d'envoi
// document.getElementById('send-button').addEventListener('click', postMessage);