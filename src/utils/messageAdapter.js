const fromDiscordToRedisMessage = (messageDiscord) => {
    let attachments = []
    messageDiscord.attachments.forEach(attachment => {
        attachments.push(attachment.url)
    })

    let links = []
    messageDiscord.embeds.forEach(embed => {
        links.push(embed.url)
    })

    return {
        id: messageDiscord.id,
        authorId: messageDiscord.author.id,
        authorName: messageDiscord.author.username,
        channelId: messageDiscord.channelId,
        content: messageDiscord.content,
        createdAt: messageDiscord.createdTimestamp,
        updatedAt: messageDiscord.editedTimestamp ? messageDiscord.editedTimestamp : messageDiscord.createdTimestamp,
        links: links,
        attachments: attachments,
        replyTo: messageDiscord.reference?.messageId || null
    }
}


const createEmptyEvaluationForm = () => {
    return [
        { label: "Rythme", notation: null, comment: "" },
        { label: "Posture", notation: null, comment: "" },
        { label: "Gamme", notation: null, comment: "" },
    ]
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