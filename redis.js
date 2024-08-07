module.exports = {
    getUsers
};

const redis = require('redis');

// Créer une instance de client Redis
const client = redis.createClient({
    socket: {
        host: "127.0.0.1",
        port: 6379
    }
});

client.connect(); //TODO ADEL se renseigner sur multi() ?
client.on('error', err => console.log('Redis Client Error', err));

const IdConstants = {
    CHANNEL: "channel",
    MESSAGE: "message",
    MESSAGES: "messages",
    USER: "user",
    USERS: "users",
}

function formatUniqueKey(prefix, objectId, suffix) {
    if (suffix) {
        return prefix + ":" + objectId + ":" + suffix
    } else {
        return prefix + objectId
    }
}

function initDataSet() {
    const users = [
        { id: 'user1', name: 'Alice' },
        { id: 'user2', name: 'Bob' },
        { id: 'user3', name: 'Charlie' },
        { id: 'user4', name: 'David' },
        { id: 'user5', name: 'Eve' },
    ];

    const channels = [
        { id: 'channel1', name: 'general' },
        { id: 'channel2', name: 'random' },
        { id: 'channel3', name: 'help' },
    ];

    const messages = [
        {
            id: 'message1',
            author: users[0],
            channel: channels[0],
            attachments: [],
            date: '01-01-2024 10:00:00',
            content: 'Hello everyone!'
        },
        {
            id: 'message2',
            author: users[1],
            channel: channels[0],
            attachments: [],
            date: '01-01-2024 10:05:00',
            content: 'Hi Alice!'
        },
        {
            id: 'message3',
            author: users[2],
            channel: channels[1],
            attachments: [],
            date: '01-01-2024 10:10:00',
            content: 'Happy New Year!'
        },
        {
            id: 'message4',
            author: users[3],
            channel: channels[2],
            attachments: [],
            date: '01-01-2024 10:15:00',
            content: 'Can anyone help me with this issue?'
        },
        {
            id: 'message5',
            author: users[4],
            channel: channels[1],
            attachments: [],
            date: '01-01-2024 10:20:00',
            content: 'Sure, what do you need help with?'
        },
        {
            id: 'message6',
            author: users[0],
            channel: channels[2],
            attachments: [],
            date: '01-01-2024 10:25:00',
            content: 'I am also available to help.'
        },
        {
            id: 'message7',
            author: users[1],
            channel: channels[0],
            attachments: [],
            date: '01-01-2024 10:30:00',
            content: 'Anyone up for a quick game?'
        },
        {
            id: 'message8',
            author: users[2],
            channel: channels[1],
            attachments: [],
            date: '01-01-2024 10:35:00',
            content: 'I am!'
        },
        {
            id: 'message9',
            author: users[3],
            channel: channels[0],
            attachments: [],
            date: '01-01-2024 10:40:00',
            content: 'Count me in.'
        },
        {
            id: 'message10',
            author: users[4],
            channel: channels[2],
            attachments: [],
            date: '01-01-2024 10:45:00',
            content: 'Let\'s go!'
        },
        {
            id: 'message11',
            author: users[0],
            channel: channels[1],
            attachments: [],
            date: '01-01-2024 10:50:00',
            content: 'What game are we playing?'
        },
        {
            id: 'message12',
            author: users[1],
            channel: channels[0],
            attachments: [],
            date: '01-01-2024 10:55:00',
            content: 'How about a quick trivia?'
        },
        {
            id: 'message13',
            author: users[2],
            channel: channels[2],
            attachments: [],
            date: '01-01-2024 11:00:00',
            content: 'I love trivia!'
        },
        {
            id: 'message14',
            author: users[3],
            channel: channels[1],
            attachments: [],
            date: '01-01-2024 11:05:00',
            content: 'Trivia sounds fun.'
        },
        {
            id: 'message15',
            author: users[4],
            channel: channels[0],
            attachments: [],
            date: '01-01-2024 11:10:00',
            content: 'Let\'s start!'
        },
        {
            id: 'message16',
            author: users[0],
            channel: channels[2],
            attachments: [],
            date: '01-01-2024 11:15:00',
            content: 'First question: What is the capital of France?'
        },
        {
            id: 'message17',
            author: users[1],
            channel: channels[0],
            attachments: [],
            date: '01-01-2024 11:20:00',
            content: 'Paris!'
        },
        {
            id: 'message18',
            author: users[2],
            channel: channels[1],
            attachments: [],
            date: '01-01-2024 11:25:00',
            content: 'Correct!'
        },
        {
            id: 'message19',
            author: users[3],
            channel: channels[2],
            attachments: [],
            date: '01-01-2024 11:30:00',
            content: 'Next question, please.'
        },
        {
            id: 'message20',
            author: users[4],
            channel: channels[0],
            attachments: [],
            date: '01-01-2024 11:35:00',
            content: 'What is 2 + 2?'
        },
    ];

    for (const user of users) {
        const key = formatUniqueKey(IdConstants.USER, user.id);
        client.del(key)
        saveRedisObject(key, user)

        const keyMessages = formatUniqueKey(IdConstants.USER, user.id, IdConstants.MESSAGES);
        client.del(keyMessages)
    }

    for (const channel of channels) {
        const key = formatUniqueKey(IdConstants.CHANNEL, channel.id);
        client.del(key)
        saveRedisObject(key, channel)
    }

    for (const message of messages) {
        const key = formatUniqueKey(IdConstants.MESSAGE, message.id);
        client.del(key)
        saveRedisObject(key, message)

        const keyMessages = formatUniqueKey(IdConstants.USER, message.author.id, IdConstants.MESSAGES);
        client.sAdd(keyMessages, key)
    }
}

async function getUsers() {
    let cursor = 0;
    const users = [];

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

    return users;
}

async function getUserMessages(userId) {
    const messageKeys = await client.sMembers(formatUniqueKey(IdConstants.USER, userId, IdConstants.MESSAGES));
    const messages = [];

    for (const key of messageKeys) {
        const message = await getRedisObject(key);
        messages.push(message);
    }

    return messages;
}

function saveRedisObject(objectId, object) {
    client.hSet(objectId, serialize(object));
}

async function getRedisObject(objectId) {
    const obj = await client.hGetAll(objectId);
    return deserialize(obj);
}

function serialize(obj) {
    const serializedObj = {};
    for (const key in obj) {
        if (typeof obj[key] === 'object') {
            serializedObj[key] = JSON.stringify(obj[key]);
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

    const userId = "user3"
    const messagesUser = await getUserMessages(userId)
    const user = await getRedisObject(formatUniqueKey(IdConstants.USER, userId))

    console.log(user)
    console.log(messagesUser)

    const users = await getUsers()
    console.log(users)
}

main()