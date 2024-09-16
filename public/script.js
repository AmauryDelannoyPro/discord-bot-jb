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
        // Message infos
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

        // Message
        const messageDiv = document.createElement('div');
        messageDiv.className = 'messageContent';
        messageDiv.innerHTML = `${message.content.replace(/\n/g, '<br>')}`;
        container.appendChild(messageDiv);

        // Vidéos
        const videosDiv = document.createElement('div');

        // vidéo discord
        if (message.attachments) {
            const videoDiv = document.createElement('div');
            message.attachments.forEach(link => {
                videoDiv.className = 'videoContent';
                videoDiv.innerHTML = `<video width="600" controls>
                    <source src="${link}" type="video/mp4">
                    Votre navigateur ne supporte pas la balise vidéo.
                </video>`;

                videosDiv.appendChild(videoDiv);
            })
        }

        // vidéo externe (YT, ...)
        if (message.links) {
            message.links.forEach(link => {
                const videoDiv = document.createElement('div');
                videoDiv.className = 'videoContent';
                videoDiv.innerHTML = `<iframe width="560" height="315" src="${link}" frameborder="0" allowfullscreen></iframe>`;
                videosDiv.appendChild(videoDiv);
            })
        }
        container.appendChild(videosDiv);

        // Evaluation
        const evaluationDiv = document.createElement('div');
        evaluationDiv.className = 'evaluationContent';
        evaluationDiv.id = `evaluation-${message.id}`;

        // Evaluation à faire
        if (message.evaluationForm) {
            const criteriasDiv = document.createElement('div');
            criteriasDiv.className = 'criteriasContent';

            for (let i = 0; i < message.evaluationForm.length; i++) {
                const criteria = message.evaluationForm[i];

                // Create a container for each criterion (form-group)
                const formGroup = document.createElement('div');
                formGroup.className = 'form-group';

                // Create a div for label and radios (label-radio-group)
                const labelRadioGroup = document.createElement('div');
                labelRadioGroup.className = 'label-radio-group';

                // Label
                const criteriaText = document.createElement('label');
                criteriaText.textContent = criteria.label;
                criteriaText.setAttribute('for', `criteria_${message.id}_${i}`);

                // Create radio buttons container
                const radioContainer = document.createElement('div');
                radioContainer.className = 'radios';

                // Radio button OK
                const okRadio = document.createElement('input');
                okRadio.type = 'radio';
                okRadio.name = `criteria_${message.id}_${i}`;
                okRadio.value = 'OK';
                okRadio.id = `ok_${message.id}_${i}`;
                okRadio.checked = criteria.notation === true;

                const okLabel = document.createElement('label');
                okLabel.textContent = 'OK';
                okLabel.setAttribute('for', okRadio.id);

                // Radio button KO
                const koRadio = document.createElement('input');
                koRadio.type = 'radio';
                koRadio.name = `criteria_${message.id}_${i}`;
                koRadio.value = 'KO';
                koRadio.id = `ko_${message.id}_${i}`;
                koRadio.checked = criteria.notation === false;

                const koLabel = document.createElement('label');
                koLabel.textContent = 'KO';
                koLabel.setAttribute('for', koRadio.id);

                // Append radio buttons to the radio container
                radioContainer.appendChild(okRadio);
                radioContainer.appendChild(okLabel);
                radioContainer.appendChild(koRadio);
                radioContainer.appendChild(koLabel);

                // Append label and radios to label-radio-group
                labelRadioGroup.appendChild(criteriaText);
                labelRadioGroup.appendChild(radioContainer);

                // Comment field
                const commentTextarea = document.createElement('textarea');
                commentTextarea.id = `comment_${message.id}_${i}`;
                commentTextarea.placeholder = 'Commentaire...';
                commentTextarea.value = criteria.comment || ''; // Set existing comment if available

                // Append label-radio-group and comment field to form-group
                formGroup.appendChild(labelRadioGroup);
                formGroup.appendChild(commentTextarea);

                // Append form-group to the evaluationDiv
                criteriasDiv.appendChild(formGroup);
                evaluationDiv.appendChild(criteriasDiv)
            }

            // Buttons 
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'button-container';

            // Button ignorer message
            const ignoreButton = document.createElement('button');
            ignoreButton.type = 'reset';
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

                    const divToUpdate = document.getElementById(`evaluation-${message.id}`);
                    if (response.ok) {
                        divToUpdate.innerHTML = "Le message sera masqué à l'avenir";
                    } else {
                        divToUpdate.innerHTML = "Un problème est survenu, le message sera toujours visible";
                    }

                } catch (error) {
                    console.error('Error performing other action:', error);
                    ignoreButton.disabled = false;
                }
            });

            // Bouton envoi formulaire
            const submitButton = document.createElement('button');
            submitButton.type = 'submit';
            submitButton.textContent = 'Envoi l\'évaluation';
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
                    const postedMessage = responseBody.messageResponse;

                    if (response.ok) {
                        const divToUpdate = document.getElementById(`evaluation-${message.id}`);
                        divToUpdate.innerHTML = postedMessage.replace(/\n/g, '<br>');
                    } else {
                        alert(postedMessage);
                        submitButton.disabled = false;
                    }

                } catch (error) {
                    console.error('Error submitting evaluation:', error);
                    submitButton.disabled = false;
                }
            });

            buttonContainer.appendChild(ignoreButton);
            buttonContainer.appendChild(submitButton);

            evaluationDiv.appendChild(buttonContainer);
            container.appendChild(evaluationDiv);
        }

        // Evaluation déjà faite
        if (message.evaluationDone) {
            const criteriaRow = document.createElement('div');
            criteriaRow.className = 'evaluationDone';

            const criteriaText = document.createElement('div');
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