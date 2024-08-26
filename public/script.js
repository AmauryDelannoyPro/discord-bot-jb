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

        const userLink = document.createElement('a');
        userLink.href = '#';
        userLink.style.display = 'flex';
        userLink.style.alignItems = 'center';
        userLink.onclick = () => loadUserMessagesContent(user.id);

        const userAvatar = document.createElement('img');
        userAvatar.src = user.avatar;
        userAvatar.alt = `${user.name} Avatar`;
        userAvatar.style.width = '40px';
        userAvatar.style.height = '40px';
        userAvatar.style.borderRadius = '50%';
        userAvatar.style.marginRight = '10px';

        const userNameText = document.createElement('span');
        userNameText.textContent = user.name;

        userLink.appendChild(userAvatar);
        userLink.appendChild(userNameText);

        userItem.appendChild(userLink);
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

        const messageInformationsDiv = document.createElement("div")
        messageInformationsDiv.className = 'messageInformationsContent';
        let sectionHtml = '';
        if (message.sectionName) {
            sectionHtml = `Section <strong>${message.sectionName}</strong><br>`;
        }
        messageInformationsDiv.innerHTML = `
            ${sectionHtml}
            Canal <strong>${message.channelName}</strong><br>
            <em>Date du message : ${message.date}</em>`
            ;
        container.appendChild(messageInformationsDiv)

        messageDiv.className = 'messageContent';
        messageDiv.innerHTML = `${message.content}`;
        container.appendChild(messageDiv);

        const evaluationDiv = document.createElement('div');
        evaluationDiv.className = 'evaluationContent';
        // Evaluation à faire
        if (message.evaluationForm) {
            message.evaluationForm.forEach((criteria, idx) => {
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

            // Button ignorer message
            const ignoreButton = document.createElement('button');
            ignoreButton.textContent = 'Ignorer ce message à l\'avenir';
            ignoreButton.addEventListener('click', async () => {
                ignoreButton.style.display = 'none';

                try {
                    const response = await fetch('/api/ignore-message', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ messageId: message.id, channelId: message.channelId })
                    });

                    if (response.ok) {
                        evaluationDiv.innerHTML = "Le message sera masqué à l'avenir";
                    } else {
                        evaluationDiv.innerHTML = "Un problème est survenue, le message sera toujours visible";
                    }

                    container.appendChild(evaluationDiv);

                } catch (error) {
                    console.error('Error performing other action:', error);
                    ignoreButton.disabled = false;
                }
            });
            evaluationDiv.appendChild(ignoreButton);

            // Bouton envoi formulaire
            const submitButton = document.createElement('button');
            submitButton.textContent = 'Submit Evaluation';
            submitButton.addEventListener('click', async () => {
                submitButton.disabled = true;
                const evaluationData = message.evaluationForm.map((criteria, idx) => {
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
                    evaluationForm: evaluationData
                };

                try {
                    const response = await fetch('/api/send-message', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });

                    const responseBody = await response.json();
                    const postedMessage = responseBody.messageResponse

                    if (response.ok) {
                        evaluationDiv.innerHTML = postedMessage.replace(/\n/g, '<br>');
                        container.appendChild(evaluationDiv);
                    } else {
                        alert(postedMessage);
                        submitButton.disabled = false;
                    }

                } catch (error) {
                    console.error('Error submitting evaluation:', error);
                    submitButton.disabled = false;
                }
            });
            evaluationDiv.appendChild(submitButton);
            container.appendChild(evaluationDiv);
        }

        // Evaluation déja faite
        if (message.evaluationDone) {
            const criteriaRow = document.createElement('div');
            criteriaRow.className = 'criteriaRow';

            const criteriaText = document.createElement('span');
            criteriaText.innerHTML = message.evaluationDone.replace(/\n/g, '<br>');

            criteriaRow.appendChild(criteriaText);

            evaluationDiv.appendChild(criteriaRow);
            container.appendChild(evaluationDiv);
        }

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