module.exports = {
    getUsers,
    getUserMessages,
    saveUsers,
    saveMessages,
    resetRedis,
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
    channelId: "channelId",
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

async function initDataSet() {
    const users = [
        { id: 'user1', name: 'Alice' },
        { id: 'user2', name: 'Bob' },
        { id: 'user3', name: 'Charlie' },
        { id: 'user4', name: 'David' },
        { id: 'user5', name: 'Eve' },
    ];

    const channelIds = [
        { id: 'channelId1', name: 'general' },
        { id: 'channelId2', name: 'random' },
        { id: 'channelId3', name: 'help' },
    ];

    const messages = [
        {
            id: 'message1',
            authorId: users[0],
            channelId: channelIds[0],
            attachments: [],
            createdAt: '01-01-2024 10:00:00',
            content: 'Hello everyone!'
        },
        {
            id: 'message2',
            authorId: users[1],
            channelId: channelIds[0],
            attachments: [],
            createdAt: '01-01-2024 10:05:00',
            content: 'Hi Alice!'
        },
        {
            id: 'message3',
            authorId: users[2],
            channelId: channelIds[1],
            attachments: [],
            createdAt: '01-01-2024 10:10:00',
            content: 'Happy New Year!'
        },
        {
            id: 'message4',
            authorId: users[3],
            channelId: channelIds[2],
            attachments: [],
            createdAt: '01-01-2024 10:15:00',
            content: 'Can anyone help me with this issue?'
        },
        {
            id: 'message5',
            authorId: users[4],
            channelId: channelIds[1],
            attachments: [],
            createdAt: '01-01-2024 10:20:00',
            content: 'Sure, what do you need help with?'
        },
        {
            id: 'message6',
            authorId: users[0],
            channelId: channelIds[2],
            attachments: [],
            createdAt: '01-01-2024 10:25:00',
            content: 'I am also available to help.'
        },
        {
            id: 'message7',
            authorId: users[1],
            channelId: channelIds[0],
            attachments: [],
            createdAt: '01-01-2024 10:30:00',
            content: 'Anyone up for a quick game?'
        },
        {
            id: 'message8',
            authorId: users[2],
            channelId: channelIds[1],
            attachments: [],
            createdAt: '01-01-2024 10:35:00',
            content: 'I am!'
        },
        {
            id: 'message9',
            authorId: users[3],
            channelId: channelIds[0],
            attachments: [],
            createdAt: '01-01-2024 10:40:00',
            content: 'Count me in.'
        },
        {
            id: 'message10',
            authorId: users[4],
            channelId: channelIds[2],
            attachments: [],
            createdAt: '01-01-2024 10:45:00',
            content: 'Let\'s go!'
        },
        {
            id: 'message11',
            authorId: users[0],
            channelId: channelIds[1],
            attachments: [],
            createdAt: '01-01-2024 10:50:00',
            content: 'What game are we playing?'
        },
        {
            id: 'message12',
            authorId: users[1],
            channelId: channelIds[0],
            attachments: [],
            createdAt: '01-01-2024 10:55:00',
            content: 'How about a quick trivia?'
        },
        {
            id: 'message13',
            authorId: users[2],
            channelId: channelIds[2],
            attachments: [],
            createdAt: '01-01-2024 11:00:00',
            content: 'I love trivia!'
        },
        {
            id: 'message14',
            authorId: users[3],
            channelId: channelIds[1],
            attachments: [],
            createdAt: '01-01-2024 11:05:00',
            content: 'Trivia sounds fun.'
        },
        {
            id: 'message15',
            authorId: users[4],
            channelId: channelIds[0],
            attachments: [],
            createdAt: '01-01-2024 11:10:00',
            content: 'Let\'s start!'
        },
        {
            id: 'message16',
            authorId: users[0],
            channelId: channelIds[2],
            attachments: [],
            createdAt: '01-01-2024 11:15:00',
            content: 'First question: What is the capital of France?'
        },
        {
            id: 'message17',
            authorId: users[1],
            channelId: channelIds[0],
            attachments: [],
            createdAt: '01-01-2024 11:20:00',
            content: 'Paris!'
        },
        {
            id: 'message18',
            authorId: users[2],
            channelId: channelIds[1],
            attachments: [],
            createdAt: '01-01-2024 11:25:00',
            content: 'Correct!'
        },
        {
            id: 'message19',
            authorId: users[3],
            channelId: channelIds[2],
            attachments: [],
            createdAt: '01-01-2024 11:30:00',
            content: 'Next question, please.'
        },
        {
            id: 'message20',
            authorId: users[4],
            channelId: channelIds[0],
            attachments: [],
            createdAt: '01-01-2024 11:35:00',
            content: 'What is 2 + 2?'
        },
    ];

    await saveUsers(users)

    for (const channelId of channelIds) {
        const key = formatUniqueKey(IdConstants.channelId, channelId.id);
        await saveRedisObject(key, channelId)
    }

    await saveMessages(messages)
}

async function saveUsers(users) {
    for (const user of users){
        const key = formatUniqueKey(IdConstants.USER, user.id);
        await saveRedisObject(key, user)
    }
}

async function saveMessages(messages){
    for (const message of messages){
        const key = formatUniqueKey(IdConstants.MESSAGE, message.id);
        await saveRedisObject(key, message)

        const keyMessages = formatUniqueKey(IdConstants.USER, message.authorId, IdConstants.MESSAGES);
        await client.sAdd(keyMessages, key)
    }
}

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

async function getUserMessages(id) {
    const messageKeys = await client.sMembers(formatUniqueKey(IdConstants.USER, id, IdConstants.MESSAGES));
    const messages = [];

    for (const key of messageKeys) {
        const message = await getRedisObject(key);
        messages.push(message);
    }

    return messages;
}

async function saveRedisObject(objectId, object) {
    await client.set(objectId, JSON.stringify(object));
}

async function getRedisObject(objectId) {
    const data = await client.get(objectId);
    return JSON.parse(data);
}

function serialize(obj) {
    const serializedObj = {};
    for (const key in obj) {
        if (typeof obj[key] === 'object') {
            serializedObj[key] = JSON.stringify(obj[key]);
        } else if (typeof obj[key] === 'number') {
            serializedObj[key] = "'" + obj[key] + "'";
        } else {
            serializedObj[key] = obj[key];
        }
    }
    return serializedObj;
}

function deserialize(obj) {
    const deserializedObj = {};
    for (const key in obj) {
        try {
            deserializedObj[key] = JSON.parse(obj[key]);
        } catch (e) {
            deserializedObj[key] = obj[key];
        }
    }
    return deserializedObj;
}

async function main() {
    initDataSet()

    // const id = "user3"
    // const messagesUser = await getUserMessages(id)
    // const user = await getRedisObject(formatUniqueKey(IdConstants.USER, id))

    // console.log(user)
    // console.log(messagesUser)

    // const users = await getUsers()
    // console.log(users)

    client.quit()
}

async function resetRedis() {
    await client.flushAll()
    console.log('Redis entirely cleared.');
}

// resetRedis()
// main()