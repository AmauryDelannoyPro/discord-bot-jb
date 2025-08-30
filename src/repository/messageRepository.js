const redis = require("../service/redis")
const discord = require("../service/discord")
const messageAdapter = require('../utils/messageAdapter')
const utils = require('../utils/utils')


const getUserMessages = async (userId) => {
    const messages = await redis.getUserMessages(userId);

    await Promise.all(messages.map(async (message) => {
        message.date = await utils.formatDateHumanReadable(message.date);
    }));

    return messages;
};


const saveMessage = async (message) => {
    redis.saveMessages([message])
}


const replyMessageOnDiscord = async (channelId, evaluation, messageIdToReply) => {
    // Don't need to call saveMessage(), we will get it with discord events
    evaluation = await getCriteriaLabelToPostedForm(evaluation)
    const message = await messageAdapter.formatEvaluationToPost(evaluation)
    if (message !== "") {
        discord.replyMessageOnDiscord(channelId, message, messageIdToReply)
        return message
    } else {
        return null
    }
}


const getCriteriaLabelToPostedForm = async (evaluation) => {
    // Depuis l'ID de critère, on va chercher son label
    const updated = {};
    for (const [key, value] of Object.entries(evaluation)) {
        const criteria = await redis.getCriteria(key);
        // Add label to current item
        updated[key] = {
            ...value,
            label: criteria.label
        };
    }

    return updated;
}


const ignoreMessage = async (channelId, messageId) => {
    redis.deleteMessage(messageId)
    discord.addReactionToMessage(channelId, messageId)
    return "Le message sera masqué à l'avenir"
}


const getCriterias = async () => {
    const criterias = await redis.getCriterias();
    return criterias.sort((a, b) => a.label.localeCompare(b.label));
};

module.exports = {
    getUserMessages,
    replyMessageOnDiscord,
    saveMessage,
    ignoreMessage,
    getCriterias,
};