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

    messages.forEach((message, index) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'messageContent';
        messageDiv.innerHTML = `Message: ${message.content}`;
        container.appendChild(messageDiv);

        const evaluationDiv = document.createElement('div');
        evaluationDiv.className = 'evaluationContent';
        message.evaluation.forEach((criteria, idx) => {
            const criteriaRow = document.createElement('div');
            criteriaRow.className = 'criteriaRow';

            // Label
            const criteriaText = document.createElement('span');
            criteriaText.textContent = criteria.label;

            // Radio buttons
            const okRadio = document.createElement('input');
            okRadio.type = 'radio';
            okRadio.name = `criteria_${message.id}_${idx}`;
            okRadio.value = 'OK';
            okRadio.checked = criteria.notation === true;

            const okLabel = document.createElement('label');
            okLabel.textContent = 'OK';
            okLabel.htmlFor = okRadio.id = `ok_${message.id}_${idx}`;

            const koRadio = document.createElement('input');
            koRadio.type = 'radio';
            koRadio.name = `criteria_${message.id}_${idx}`;
            koRadio.value = 'KO';
            koRadio.checked = criteria.notation === false;

            const koLabel = document.createElement('label');
            koLabel.textContent = 'KO';
            koLabel.htmlFor = koRadio.id = `ko_${message.id}_${idx}`;

            // Champ commentaire
            const commentLabel = document.createElement('label');
            commentLabel.textContent = 'Commentaire:';
            commentLabel.htmlFor = `comment_${message.id}_${idx}`;

            const commentInput = document.createElement('input');
            commentInput.type = 'text';
            commentInput.id = `comment_${message.id}_${idx}`;
            commentInput.value = criteria.comment || ''; // Définit la valeur du champ de saisie s'il y a déjà un commentaire

            criteriaRow.appendChild(criteriaText);
            criteriaRow.appendChild(okRadio);
            criteriaRow.appendChild(okLabel);
            criteriaRow.appendChild(koRadio);
            criteriaRow.appendChild(koLabel);
            criteriaRow.appendChild(commentLabel);
            criteriaRow.appendChild(commentInput);

            evaluationDiv.appendChild(criteriaRow);
        });


        const submitButton = document.createElement('button');
        submitButton.textContent = 'Submit Evaluation';
        submitButton.addEventListener('click', async () => {
            const evaluationData = message.evaluation.map((criteria, idx) => {
                const notation = document.querySelector(`input[name="criteria_${message.id}_${idx}"]:checked`)?.value;
                const comment = document.getElementById(`comment_${message.id}_${idx}`).value;

                return {
                    criteria: criteria.label,
                    notation: notation ? (notation === 'OK') : null,
                    comment: comment
                };
            });

            const payload = {
                messageId: message.id,
                channelId: message.channelId,
                evaluation: evaluationData
            };

            try {
                const response = await fetch('/api/send-message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

            } catch (error) {
                console.error('Error submitting evaluation:', error);
            }
        });
        evaluationDiv.appendChild(submitButton);

        container.appendChild(evaluationDiv);

        if (index < messages.length - 1) {
            const horizontalSeparator = document.createElement('hr');
            container.appendChild(horizontalSeparator);
        }
    });

}
// #endregion

function initView() {
    loadUsersContent()
}

// Charger les données dynamiques au chargement de la page
window.onload = initView;

// Ajouter un écouteur d'événements au bouton d'envoi
// document.getElementById('send-button').addEventListener('click', postMessage);