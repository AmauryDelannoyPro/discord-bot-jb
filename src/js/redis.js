module.exports = {
    getUsers,
    getUserMessages,
    saveUsers,
    saveMessages,
    resetRedis,
    getUsersByRecentMessages,
};

const utils = require("./utils")
const redis = require('redis');
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
async function getUserMessages(id) {
    const messageKeys = await client.sMembers(formatUniqueKey(IdConstants.USER, id, IdConstants.MESSAGES));
    const messages = [];

    const fetchMessagesPromises = messageKeys.map(async (key) => {
        const message = await getRedisObject(key)
        if (message.evaluationId) {
            // TODO ADEL recupérer l'évaluation et remplir les champs
        } else {
            //TODO ADEL voir où construire le formulaire
            message.evaluation = [
                { label: "Rythme", notation: null, comment: "" },
                { label: "Posture", notation: null, comment: "" },
                { label: "Gamme", notation: null, comment: "" },
            ]
        }
        messages.push(message);
    })

    await Promise.all(fetchMessagesPromises)
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
        const messageDate = new Date(message.updatedAt).getTime();
        const lastMessageKey = formatUniqueKey(IdConstants.USER, message.authorId, IdConstants.LAST_MESSAGE_DATE)

        const lastSavedDate = await client.get(lastMessageKey);
        const lastSavedTimestamp = lastSavedDate ? parseInt(lastSavedDate) : 0;

        if (messageDate > lastSavedTimestamp) {
            await client.set(lastMessageKey, messageDate);
        }
    }

    //TODO ADEL Reprise ici sauvegarder les messages de JBOT avec un replyTo dans "message:msgId:evaluation"
    await Promise.all([fetchMessagesPromises, fetchUserMessagesPromises])
}
// endregion messages


/**
 * Peut servir pour debug
 */
async function main() {
    // initDataSet()

    // const id = "user3"
    // const messagesUser = await getUserMessages(id)
    // const user = await getRedisObject(formatUniqueKey(IdConstants.USER, id))

    // console.log(user)
    // console.log(messagesUser)

    // const users = await getUsers()
    // console.log(users)

    // client.quit()
}

// resetRedis()
// main()