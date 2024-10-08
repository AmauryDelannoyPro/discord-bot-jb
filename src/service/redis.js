const redis = require('redis');
const messageAdapter = require('../utils/messageAdapter')


const redisUrl = process.env.REDIS_URL;
const redisPort = process.env.REDIS_PORT;

// Créer une instance de client Redis
const client = redis.createClient({
    socket: {
        host: redisUrl,
        port: redisPort
    }
});

client.connect(); //TODO ADEL se renseigner sur multi() ?
client.on('error', err => console.log('Redis Client Error', err));

const IdConstants = {
    EVALUATION_ID: "evaluation_id",
    LAST_MESSAGE_DATE: "last_message_date",
    MESSAGE: "message",
    MESSAGES: "messages",
    USER: "user",
    USERS: "users",
}

function formatUniqueKey(prefix, objectId, suffix) {
    if (suffix) {
        return prefix + ":" + objectId + ":" + suffix
    } else {
        return prefix + ":" + objectId
    }
}

async function resetRedis() {
    await client.flushAll()
    console.log('Redis entirely cleared.');
}

async function saveRedisObject(objectId, object) {
    await client.set(objectId, JSON.stringify(object));
}

async function getRedisObject(objectId) {
    const data = await client.get(objectId);
    return JSON.parse(data);
}

async function deleteRedisObject(objectId) {
    await client.del(objectId);
    return
}


// region user
// ----- GETTERs -----
async function getUsers() {
    let cursor = 0;
    const users = [];

    try {
        do {
            const reply = await client.scan(cursor, { MATCH: IdConstants.USER + ':*' });
            cursor = reply.cursor;
            const keys = reply.keys;

            for (const key of keys) {
                if (key.startsWith(IdConstants.USER) && !key.endsWith(IdConstants.MESSAGES)) {
                    const user = await getRedisObject(key);
                    users.push(user);
                }
            }
        } while (cursor !== 0);
    } catch (error) {
        // Do something ...
    }

    return users;
}

async function getUsersByRecentMessages(recentFirst) {
    const userRecentMessageDates = [];
    const users = await getUsers()

    const userPromises = users.map(async (user) => {
        const lastMessageKey = formatUniqueKey(IdConstants.USER, user.id, IdConstants.LAST_MESSAGE_DATE);
        const mostRecentDate = await client.get(lastMessageKey);

        if (mostRecentDate) {
            userRecentMessageDates.push({ user, mostRecentDate: parseInt(mostRecentDate) });
        }
    });

    await Promise.all(userPromises);

    userRecentMessageDates.sort((a, b) => recentFirst ? b.mostRecentDate - a.mostRecentDate : a.mostRecentDate - b.mostRecentDate);
    return userRecentMessageDates.map(entry => entry.user);
}

// ----- SETTERS -----
async function saveUsers(users) {
    const fetchPromises = users.map(user => {
        const key = formatUniqueKey(IdConstants.USER, user.id);
        return saveRedisObject(key, user)
    })
    await Promise.all(fetchPromises)
}
// endregion user


// region messages
// ----- GETTERS -----
async function getUserMessages(userId) {
    const messageKeys = await client.sMembers(formatUniqueKey(IdConstants.USER, userId, IdConstants.MESSAGES));

    const fetchMessagesPromises = messageKeys.map(async (key) => {
        const messagePromise = getRedisObject(key);
        const evaluationIdKey = formatUniqueKey(IdConstants.MESSAGE, key.split(':')[1], IdConstants.EVALUATION_ID);
        const evaluationIdPromise = getRedisObject(evaluationIdKey);

        const [message, evaluationId] = await Promise.all([messagePromise, evaluationIdPromise]);

        if (evaluationId !== null) {
            const evaluationMessage = await getRedisObject(formatUniqueKey(IdConstants.MESSAGE, evaluationId));
            message.evaluationDone = evaluationMessage.content;
        } else {
            message.evaluationForm = messageAdapter.createEmptyEvaluationForm();
        }
        return message;
    });

    const messages = await Promise.all(fetchMessagesPromises);
    messages.sort((a, b) => b.updatedAt - a.updatedAt);
    return messages;
}

// ----- SETTERS -----
async function saveMessages(messages) {
    const fetchMessagesPromises = messages.map(message => {
        const key = formatUniqueKey(IdConstants.MESSAGE, message.id);
        return saveRedisObject(key, message)
    })
    const fetchUserMessagesPromises = messages.map(message => {
        const key = formatUniqueKey(IdConstants.MESSAGE, message.id);
        const keyMessages = formatUniqueKey(IdConstants.USER, message.authorId, IdConstants.MESSAGES);
        return client.sAdd(keyMessages, key)
    })

    for (const message of messages) {
        await setLastMessage(message)

        // Save evaluation already done
        if (message.authorName === process.env.DISCORD_BOT_NAME && message.replyTo !== null) {
            const key = formatUniqueKey(IdConstants.MESSAGE, message.replyTo, IdConstants.EVALUATION_ID);
            saveRedisObject(key, message.id)
        }
    }

    await Promise.all([fetchMessagesPromises, fetchUserMessagesPromises])
}


async function setLastMessage(message, force = false) {
    const messageDate = new Date(message.updatedAt).getTime();
    const lastMessageKey = formatUniqueKey(IdConstants.USER, message.authorId, IdConstants.LAST_MESSAGE_DATE)

    const lastSavedDate = await client.get(lastMessageKey);
    const lastSavedTimestamp = lastSavedDate ? parseInt(lastSavedDate) : 0;

    if (force || messageDate > lastSavedTimestamp) {
        await client.set(lastMessageKey, messageDate);
    }
}


async function deleteMessage(messageId) {
    deleteMessages([messageId])
}


async function deleteMessages(messageIds) {
    for (const messageId of messageIds) {
        const messageKey = formatUniqueKey(IdConstants.MESSAGE, messageId);
        const message = await getRedisObject(messageKey)

        // Delete message
        await deleteRedisObject(messageKey)

        // User's message (to get his/her message list)
        const userMessagesKey = formatUniqueKey(IdConstants.USER, message.authorId, IdConstants.MESSAGES);
        await client.sRem(userMessagesKey, messageKey)

        // Last message (to sort user by last message sent)
        const lastMessageKey = formatUniqueKey(IdConstants.USER, message.authorId, IdConstants.LAST_MESSAGE_DATE)
        const lastSavedDate = await client.get(lastMessageKey);

        if (message.updatedAt == lastSavedDate) {
            // Save new last message of user
            const userMessages = await getUserMessages(message.authorId)
            if (userMessages.length > 0) {
                const newLastMessage = userMessages[0]
                setLastMessage(newLastMessage, true)
            }
        }

        // Update evaluation if deleted a JBOT's message
        if (message.authorName === process.env.DISCORD_BOT_NAME) {
            const key = formatUniqueKey(IdConstants.MESSAGE, message.replyTo, IdConstants.EVALUATION_ID);
            deleteRedisObject(key)
        }
    }
}
// endregion messages


module.exports = {
    getUsers,
    getUserMessages,
    saveUsers,
    saveMessages,
    resetRedis,
    getUsersByRecentMessages,
    deleteMessage,
    deleteMessages,
};
