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

async function getUsersByRecentMessages(recentFirst) {
    const userRecentMessageDates = [];
    const users = await getUsers()
    for (const user of users) {
        const userId = user.id
        let mostRecentDate = 0;
        const messages = await getUserMessages(userId) //TODO Promise.all()
        if (messages.length > 0) {
            for (const message of messages) {
                const messageDate = new Date(message.createdAt).getTime()
                if (messageDate > mostRecentDate) {
                    mostRecentDate = messageDate;
                }
            }
        }
        if (mostRecentDate > 0) {
            userRecentMessageDates.push({ user, mostRecentDate });
        }
    }

    // TODO ADEL Tri user OK Mais les messages entre eux ne sont pas triés dans l'ordre
    // Reprise ici

    userRecentMessageDates.sort((a, b) => b.mostRecentDate - a.mostRecentDate);

    return userRecentMessageDates.map(entry => entry.user);
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