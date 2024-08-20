module.exports = {
    getUsers,
    getUserMessages,
    replyMessageOnDiscord,
    init,
    saveMessage,
    getUsersByRecentMessages,
};

const redis = require("./redis")
const discord = require("./discord")
const utils = require("./utils")


// region user
async function fetchDiscordUsers() {
    const discordUsers = await discord.getUsers()
    await redis.saveUsers(discordUsers)
}

async function getUsers() {
    const users = await redis.getUsers()
    return users
}

async function getUsersByRecentMessages(recentFirst = true) {
    return redis.getUsersByRecentMessages(recentFirst)
}
// endregion user


// region message
async function fetchDiscordMessages() {
    const discordMessages = await discord.getChannelMessages(process.env.CHANNELS_LISTENED.split(','))
    await redis.saveMessages(discordMessages)
}

async function getUserMessages(userId) {
    const userMessages = await redis.getUserMessages(userId)
    return userMessages
}

async function saveMessage(message) {
    redis.saveMessages([message])
}

function replyMessageOnDiscord(channelId, message, messageIdToReply) {
    // Don't need to call saveMessage(), we will get it with discord events
    discord.replyMessageOnDiscord(channelId, message, messageIdToReply)
}
// endregion message


async function init() {
    console.log("Initialization datas ...")
    await Promise.all([
        redis.resetRedis(), // TODO Tester si Redis supporte de tout stocker. Si oui, ne pas mettre. Si non : expiration des données + clear au lancement
        discord.init(),
    ])

    // Peut-être retiré en phase de dev si un pull a déja été fait + bdd pas clear
    await Promise.all([
        fetchDiscordUsers(),
        fetchDiscordMessages(),
    ])

    return new Promise((resolve) => {
        console.log("Initialization finished !\n")
        resolve()
    });
}