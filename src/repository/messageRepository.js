const redis = require("../service/redis")
const discord = require("../service/discord")
const messageAdapter = require('../utils/messageAdapter')


const getUserMessages = async (userId) => {
    return redis.getUserMessages(userId)
}


const saveMessage = async (message) => {
    redis.saveMessages([message])
}


const replyMessageOnDiscord = async (channelId, evaluations, messageIdToReply) => {
    // Don't need to call saveMessage(), we will get it with discord events
    const message = await messageAdapter.formatEvaluationToPost(evaluations)
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