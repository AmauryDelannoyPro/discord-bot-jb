module.exports = {
    getUsers,
    getUserMessages,
    replyMessageOnDiscord,
    init
};

const redis = require("./redis")
const discord = require("./discord")
const utils = require("./utils")

async function getUsers() {
    const users = await redis.getUsers()
    return users
}

async function getUserMessages(userId) {
    const userMessages = await redis.getUserMessages(userId)
    return userMessages
}

function replyMessageOnDiscord(channelId, message, messageIdToReply) {
    discord.replyMessageOnDiscord(channelId, message, messageIdToReply)
}

async function fetchDiscordUsers(){
    const discordUsers = await discord.getUsers()
    await redis.saveUsers(discordUsers)
}

async function fetchDiscordMessages(){
    const discordMessages = await discord.getChannelMessages(process.env.CHANNELS_LISTENED.split(','))
    await redis.saveMessages(discordMessages)
}

async function init() {
    console.log("Initialization datas ...")
    await Promise.all([
        // redis.resetRedis(), // TODO Pour avoir un jeu de données propre. A retirer en prod ?
        discord.init(),
    ])

    // TODO Meme question : faire a chaque démarrage d'app ?
    // await Promise.all([
    //     fetchDiscordUsers(),
    //     fetchDiscordMessages(),
    // ])

    return new Promise((resolve) => {
        console.log("Initialization DONE")
        resolve()
    });
}