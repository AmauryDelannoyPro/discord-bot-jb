module.exports = {
    addUserMessage,
    getMostRecentTimestamp,
    log,
    serialize,
    deserialize
};

function addUserMessage(usersMap, user, message) {
    if (!usersMap[user.id]) {
        usersMap[user.id] = {
            "user": user,
            "messages": [message]
        }
    } else {
        usersMap[user.id]["messages"].push(message)
    }
    return usersMap
}

function getMostRecentTimestamp(editTimestamp, creationTimestamp) {
    if (editTimestamp) {
        return new Date(editTimestamp) > new Date(creationTimestamp) ? editTimestamp : creationTimestamp;
    } else {
        return creationTimestamp;
    }
}

function log(message) {
    console.log(JSON.stringify(message, null, 2))
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