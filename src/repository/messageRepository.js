const redis = require("../service/redis")
const discord = require("../service/discord")
const messageAdapter = require('../utils/messageAdapter')
const utils = require('../utils/utils')


const getUserMessages = async (userId) => {
    const messages = await redis.getUserMessages(userId);

    await Promise.all(messages.map(async (message) => {
        message.date = await utils.formatDateHumanReadable(message.updatedAt);
    }));

    return messages;
};



const saveMessage = async (message) => {
    redis.saveMessages([message])
}


const replyMessageOnDiscord = async (channelId, evaluations, messageIdToReply) => {
    // Don't need to call saveMessage(), we will get it with discord events
    const message = await messageAdapter.formatEvaluationToPost(evaluations)
    if (message !== "") {
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