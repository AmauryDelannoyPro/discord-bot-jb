const utils = require('../utils/utils')

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


const createEmptyEvaluationForm = () => {
    const criteriasName = process.env.FORMULAIRE_CRITERES.split(",")
    return criteriasName
        .filter(criteria => criteria && criteria.trim())
        .map(criteria => (
            { label: criteria, notation: null, comment: "" }
        ))
        .sort((a, b) => a.label.localeCompare(b.label));
}


const formatEvaluationToPost = async (evaluations) => {
    const messageFormatted = evaluations
        .filter(evaluation => evaluation.notation !== null || evaluation.comment !== "")
        .map(evaluation => {
            const emoji = evaluation.notation !== null
                ? (evaluation.notation === true ? "✅" : "❌")
                : "";
            return `${evaluation.criteria}: ${emoji} ${evaluation.comment}`.trim();
        })
        .join("\n");

    return messageFormatted
}


module.exports = {
    fromDiscordToRedisMessage,
    createEmptyEvaluationForm,
    formatEvaluationToPost,
}