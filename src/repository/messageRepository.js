const redis = require("../service/redis")
const discord = require("../service/discord")


const getUserMessages = async (userId) => {
    return redis.getUserMessages(userId)
}


const saveMessage = async (message) => {
    redis.saveMessages([message])
}

//TODO ADEL bouger dans messageAdapter
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


const replyMessageOnDiscord = async (channelId, evaluations, messageIdToReply) => {
    // Don't need to call saveMessage(), we will get it with discord events
    const message = await formatEvaluationToPost(evaluations)
    if (message !== ""){
        discord.replyMessageOnDiscord(channelId, message, messageIdToReply)
        return message
    } else {
        return null
    }
}


const ignoreMessage = async (channelId, messageId) => {
    redis.deleteMessage(messageId)
    discord.addReactionToMessage(channelId, messageId)
}


module.exports = {
    getUserMessages,
    replyMessageOnDiscord,
    saveMessage,
    ignoreMessage
};