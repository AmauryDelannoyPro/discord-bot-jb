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


const formatDateHumanReadable = async (input) => {
    const date = new Date(input);
    return date.toLocaleString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}


const formatUrl = (input) => {
    if (input.toLowerCase().includes("youtube")) {
        return (input.split('&')[0]).replace("watch?v=", "embed/")
    } else if (input.toLowerCase().includes("dailymotion")) {
        return (input.split('&')[0]).replace("video/", "embed/video/")
    }
    return null
}


module.exports = {
    log,
    serialize,
    deserialize,
    formatDateHumanReadable,
    formatUrl,
};