module.exports = {
    fetchMessages,
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

const REACTION_MESSAGE_TO_IGNORE = "🔕" //TODO fonctionne sur tous les OS ?
const BOT_NAME = "JBot" // used when filtering bot messages
const WEBSITE_DOMAIN_UPLOADED_VIDEO = ["youtube", "vimeo", "dailymotion"]

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


// region utils
function formatMessage(messageDiscord) {
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
        channelId: messageDiscord.channelId,
        content: messageDiscord.content,
        createdAt: messageDiscord.createdTimestamp,
        updatedAt: messageDiscord.editedTimestamp ? messageDiscord.editedTimestamp : messageDiscord.createdTimestamp,
        links: links,
        attachments: attachments
    }
}

function formatUser(userDiscord) {
    return {
        id: userDiscord.user.id,
        name: userDiscord.user.globalName,
        avatar: userDiscord.user.displayAvatarURL()
    }
}

async function filterMessage(messageDiscord) {
    // Filter JBOT's messages : keep messages post by JBOT (it's an evaluation)
    if (messageDiscord.author.username === BOT_NAME) {
        return true
    }

    // Filter reactions : dont take message set to ignored by JBOT
    const filteredReactions = messageDiscord.reactions.cache.find(reaction => reaction.emoji.name === REACTION_MESSAGE_TO_IGNORE);
    if (filteredReactions) {
        const users = await filteredReactions.users.fetch();
        const botUsers = users.find(user => user.username == BOT_NAME);
        if (botUsers) {
            return false
        }
    }

    // Filter videos : save only messages with attachment or link, to get video to evaluate
    const isAttachment = messageDiscord.attachments.some(attachment => attachment.contentType.includes("video/"));
    const isEmbed = messageDiscord.embeds.some(embed => WEBSITE_DOMAIN_UPLOADED_VIDEO.some(webDomain => embed.data.url.includes(webDomain)));

    return isAttachment || isEmbed
}
// endregion utils


async function fetchMessages(channelId) {
    utils.log("DISCORD start fetchMessages(" + channelId + ")");

    try {
        const channel = await client.channels.fetch(channelId);
        const messages = await channel.messages.fetch();

        const filteredMessages = await Promise.all(
            messages.map(async (message) => {
                return {
                    message,
                    shouldInclude: await filterMessage(message)
                };
            })
        );

        return filteredMessages
            .filter(({ shouldInclude }) => shouldInclude)
            .map(({ message }) => formatMessage(message));

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
* Reply to a message with our message
* @param {string} channelId 
* @param {*} message our answer / evaluation
* @param {string} messageIdToReply message evaluated containing video
*/
function replyMessageOnDiscord(channelId, message, messageIdToReply) {
    utils.log("DISCORD start replyMessageOnDiscord()")
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

async function addReactionToMessage(channelId, messageId, emoji) {
    try {
        const channel = await client.channels.fetch(channelId);
        const message = await channel.messages.fetch(messageId);
        message.react(emoji);
    } catch (error) {
        console.error('Error reacting to message:', error);
    }
}