const redis = require('redis');

// Créer une instance de client Redis
const client = redis.createClient({
    socket: {
        host: "127.0.0.1",
        port: 6379
    }
});

client.on('error', err => console.log('Redis Client Error', err));

async function main() {
    await client.connect();

    // Init data set
    const messageKey1 = "idMessage1"
    const message1 = {
        id: messageKey1,
        author: {
            id: "idAAA",
            name: "AAA"
        },
        channel: {
            id: "channelId",
            name: "echange-retours"
        },
        attachments: [],
        date: "01-01-1991 02:10:00",
        content: "Premier message en 'BDD' Redis"
    }
    
    const messageKey2 = "idMessage2"
    const message2 = {
        id: messageKey2,
        author: {
            id: "idZF",
            name: "ZF"
        },
        channel: {
            id: "channelId",
            name: "echange-retours"
        },
        attachments: [],
        date: "16-01-1991 00:00:00",
        content: "Message de l'autre BG là"
    }

    const messages = [message1, message2]

    // Clear datas
    client.del(messageKey1)
    client.del(messageKey2)
    client.del("messages")

    // Store Map
    saveRedisObject(messageKey1, message1)
    // Read map
    const getMessage = await getRedisObject(messageKey1)
    console.log(getMessage)

    // Store List
    saveRedisList("messages", messages)
    // Read List
    const getMessages = await getRedisList("messages") 
    console.log(getMessages)
}

async function saveRedisObject(objectId, object){
    await client.hSet(objectId, serialize(object)); // hSet pour map
}

async function getRedisObject(objectId){
    const obj = await client.hGetAll(objectId);
    return deserialize(obj);
}

async function saveRedisList(listId, list){
    await client.rPush(listId, list.map(message => JSON.stringify(serialize(message)))); // rPush (=append) ou lPush (="insert(0)"") pour list
}

async function getRedisList(listId){
    const response = await client.lRange(listId, 0, -1); 
    return response.map(serializedMessage => deserialize(JSON.parse(serializedMessage)));
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

main()