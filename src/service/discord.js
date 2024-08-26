const Discord = require('discord.js')
const utils = require("../utils/utils")
const redis = require("./redis")
const messageAdapter = require("../utils/messageAdapter")
const userAdapter = require("../utils/userAdapter")
const serverId = process.env.DISCORD_SERVER_ID


const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent,
    ]
});


const REACTION_MESSAGE_TO_IGNORE = "🔕"
const BOT_NAME = process.env.DISCORD_BOT_NAME // used when filtering bot messages
const WEBSITE_DOMAIN_UPLOADED_VIDEO = ["youtube", "vimeo", "dailymotion"]


const init = async () => {
    await client.login(process.env.DISCORD_BOT_TOKEN)
    utils.log("Discord connected !")
}


client.on("messageCreate", (message) => {
    utils.log("onMessageCreate", message.content)
    redis.saveMessages([messageAdapter.fromDiscordToRedisMessage(message)])
})

client.on("messageUpdate", (oldMessage, newMessage) => {
    const msg = "'" + oldMessage.content + "' devient '" + newMessage.content + "'"
    utils.log("onMessageUpdate", msg)
    redis.saveMessages([messageAdapter.fromDiscordToRedisMessage(newMessage)])
})

client.on("messageDelete", (message) => {
    utils.log("onMessageDelete", message.content)
    redis.deleteMessage(message.id)
})

client.on("error", (err) => {
    utils.err(err)
})


const filterMessage = async (messageDiscord) => {
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


const fetchMessages = async (channelId) => {
    utils.log("DISCORD start fetchMessages(" + channelId + ")");
    try {
        // L'API limite les messages par 100, on peut récupérer plus en bouclant plusieurs appels
        const channel = await client.channels.fetch(channelId);

        // Get section name
        let parentChannelName = null
        if (channel.parentId) {
            const parentChannel = await client.channels.fetch(channel.parentId);
            parentChannelName = parentChannel.name
        }

        const messages = await channel.messages.fetch();

        const results = [];
        for (const message of messages.values()) {
            if (await filterMessage(message)) {
                results.push(
                    messageAdapter.fromDiscordToRedisMessage(message, channel.name, parentChannelName)
                );
            }
        }

        return results;

    } catch (error) {
        console.error(`Error fetching messages for channel ${channelId}:`, error);
        return [];
    }
}


const getChannelMessages = async (channelIdList) => {
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


const fetchUsers = async () => {
    utils.log("DISCORD start fetchUsers()")
    try {
        const guild = await client.guilds.fetch(serverId);
        const members = await guild.members.fetch();

        return members
            .filter(member => !member.user.bot)
            .map(member => userAdapter.fromDiscordToRedisUser(member))
    } catch (error) {
        console.error(error);
        return [];
    }
}

const replyMessageOnDiscord = (channelId, message, messageIdToReply) => {
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


const addReactionToMessage = async (channelId, messageId, emoji = REACTION_MESSAGE_TO_IGNORE) => {
    try {
        const channel = await client.channels.fetch(channelId);
        const message = await channel.messages.fetch(messageId);
        message.react(emoji);
    } catch (error) {
        console.error('Error reacting to message:', error);
    }
}


module.exports = {
    fetchMessages,
    replyMessageOnDiscord,
    fetchUsers,
    getChannelMessages,
    init,
    addReactionToMessage,
};