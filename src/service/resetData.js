const redis = require("./redis")
const discord = require("./discord")


async function fetchDiscordUsers() {
    const discordUsers = await discord.fetchUsers()
    await redis.saveUsers(discordUsers)
}

const fetchDiscordMessages = async () => {
    const discordMessages = await discord.getChannelMessages(process.env.CHANNELS_LISTENED.split(','))
    await redis.saveMessages(discordMessages)
}


async function init() {
    console.log("Initialization datas ...")
    await Promise.all([
        // redis.resetRedis(), // TODO Tester si Redis supporte de tout stocker. Si oui, ne pas mettre. Si non : expiration des données + clear au lancement
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

module.exports = {
    init
}