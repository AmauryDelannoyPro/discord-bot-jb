module.exports = {
    fetchMessages,
    postMessageOnDiscord,
    replyMessageOnDiscord,
    getUsers,
    getChannelMessages,
    init,
};

const Discord = require('discord.js')
const utils = require("./utils")
const repo = require("./dataRepository")
const serverId = process.env.DISCORD_SERVER_ID

const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent,
    ]
});

const REACTION_MESSAGE_TO_IGNORE = ""

async function init() {
    await client.login(process.env.DISCORD_BOT_TOKEN)    
    console.log("Discord connected !")
}

client.on("messageCreate", (message) => {
    console.log("onMessageCreate", message.content)
    repo.saveMessage(formatMessage(message))
})

client.on("messageUpdate", (oldMessage, newMessage) => {
    const msg = "'" + oldMessage.content + "' devient '" + newMessage.content + "'"
    console.log("onMessageUpdate", msg)
    repo.saveMessage(formatMessage(newMessage))
})

client.on("messageDelete", (message) => {
    console.log("onMessageDelete", message.content)
    // TODO On s'en fout ?
})

client.on("error", (err) => {
    console.err(err)
})

function formatMessage(messageDiscord){
    return {
        id: messageDiscord.id,
        authorId: messageDiscord.author.id,
        channelId: messageDiscord.channelId,
        content: messageDiscord.content,
        createdAt: messageDiscord.createdTimestamp,
        updatedAt: messageDiscord.editedTimestamp
    }
}

function formatUser(userDiscord){
    return {
        id: userDiscord.user.id,
        name: userDiscord.user.globalName,
        avatar: userDiscord.user.displayAvatarURL()
    }
}

async function fetchMessages(channelId, limit = 5) { // TODO Besoin d'une limite ? A tester sur un gros volume de messages
    utils.log("DISCORD start fetchMessages(" + channelId + ")");

    try {
        const channel = await client.channels.fetch(channelId);
        // const messages = await channel.messages.fetch({ limit: limit });
        const messages = await channel.messages.fetch();
        return messages
            .filter(message => !message.author.bot)
            //TODO filtrer message avec vidéos
            //TODO filtrer message sans la réaction REACTION_MESSAGE_TO_IGNORE (choisir l'émoji)
            //TODO garder les messages de bot pour récup les évaluations à afficher dans l'historique
            .map(message => formatMessage(message));
    } catch (error) {
        console.error(`Error fetching messages for channel ${channelId}:`, error);
        return [];
    }
}

async function getChannelMessages(channelIdList) {
    let allMessages = []

    const fetchPromises = channelIdList.map(channelId => {
        if (channelId.length !== 0) {
            return fetchMessages(channelId)
        }
    })
    const allFetchedMessages = await Promise.all(fetchPromises)

    allFetchedMessages.forEach(messages => {
        if (messages) {
            allMessages.push(...messages)
        }
    })

    return allMessages
}

async function getUsers() {
    utils.log("DISCORD start getUsers()")
    try {
        const guild = await client.guilds.fetch(serverId);
        const members = await guild.members.fetch();

        return members
            .filter(member => !member.user.bot)
            .map(member => formatUser(member))
    } catch (error) {
        console.error(error);
    }
}

/**
 * Post a message on channel with our message
 * @deprecated Use replyMessageOnDiscord(message, messageIdToReply) instead
 * @param {string} channelId 
 * @param {*} message our answer / evaluation
 */
function postMessageOnDiscord(channelId, message) {
    client.channels.fetch(channelId)
        .then(channel => {
            channel.send(message)
                .then(() => {
                    utils.log("Message posté")
                })
        })
        .catch(console.error)
}

/**
* Reply to a message with our message
* @param {string} channelId 
* @param {*} message our answer / evaluation
* @param {string} messageIdToReply message evaluated containing video
*/
function replyMessageOnDiscord(channelId, message, messageIdToReply) {
    client.channels.fetch(channelId)
        .then(channel => {
            channel.send(
                {
                    content: message,
                    reply: {
                        messageReference: messageIdToReply
                    }
                }
            )
                .then(() => {
                    utils.log("Message posté")
                })
        })
        .catch(console.error)
}