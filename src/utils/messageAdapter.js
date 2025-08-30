const utils = require('../utils/utils')

// DEPRECATED
const fromDiscordToRedisMessage = (messageDiscord, channelName, sectionName) => {
    let attachments = []
    messageDiscord.attachments.forEach(attachment => {
        attachments.push(attachment.url)
    })

    let links = []
    messageDiscord.embeds.forEach(embed => {
        const formattedUrl = utils.formatUrl(embed.url)
        if (formattedUrl) {
            links.push(formattedUrl)
        }
    })

    return {
        id: messageDiscord.id,
        authorId: messageDiscord.author.id,
        authorName: messageDiscord.author.username,
        channelId: messageDiscord.channelId,
        channelName: channelName,
        sectionName: sectionName,
        content: messageDiscord.content,
        createdAt: messageDiscord.createdTimestamp,
        updatedAt: messageDiscord.editedTimestamp ? messageDiscord.editedTimestamp : messageDiscord.createdTimestamp,
        links: links,
        attachments: attachments,
        replyTo: messageDiscord.reference?.messageId || null
    }
}

const fromDiscordToPupilMessage = (messageDiscord, channelName, sectionName) => {
    let links = []
    messageDiscord.embeds.forEach(embed => {
        const formattedUrl = utils.formatUrl(embed.url)
        if (formattedUrl) {
            links.push(formattedUrl)
        }
    })
    messageDiscord.attachments.forEach(attachment => {
        links.push(attachment.url)
    })

    return {
        id: messageDiscord.id,
        channelId: messageDiscord.channelId,
        author: {
            id: messageDiscord.author.id,
            name: messageDiscord.author.username,
            avatar: messageDiscord.author.displayAvatarURL(),
        },
        channel: channelName,
        date: messageDiscord.editedTimestamp ? messageDiscord.editedTimestamp : messageDiscord.createdTimestamp,
        content: messageDiscord.content,
        embeds : links,
        evaluation : null,
        replyTo: messageDiscord.reference?.messageId || null
    }
}


const createEmptyEvaluationForm = () => {
    const criteriasName = process.env.FORMULAIRE_CRITERES.split(",")
    return criteriasName
        .filter(criteria => criteria && criteria.trim())
        .map(criteria => (
            { label: criteria, id: "id_"+criteria.replaceAll(" ","-")}
        ))
        .sort((a, b) => a.label.localeCompare(b.label));
}


const formatEvaluationToPost = async (evaluation) => {
    // 1. Filtre les critères sélectionnés et dont l'évaluation ou le commentaire sont renseignés
    // 2. Formalise la réponse selon ce qui a été rempli dans le formulaire
    const messageFormatted = Object.entries(evaluation)
        .filter(
        ([criteriaId, eval]) =>
            eval.selected === true && (eval.value !== null || eval.comments !== "")
        )
        .map(([criteriaId, eval]) => {
            const emoji = eval.value !== null
                ? (eval.value === true ? "✅" : "❌")
                : "";
            return `${criteriaId}: ${emoji} ${eval.comments}`.trim();
        })
        .join("\n");

    return messageFormatted;
};


module.exports = {
    fromDiscordToRedisMessage,
    fromDiscordToPupilMessage,
    createEmptyEvaluationForm,
    formatEvaluationToPost,
}