module.exports = {
    addUserMessage,
    getMostRecentTimestamp,
    log
};

function addUserMessage(usersMap, user, message) {
    if (!usersMap[user.id]) {
        usersMap[user.id] = {}
        usersMap[user.id]["user"] = user
        usersMap[user.id]["messages"] = []
    }
    usersMap[user.id]["messages"].push(message)
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
