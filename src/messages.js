import xml from "xml";

export function success(uuid) {
    const xmlMessage = {
        Success: [
            {
                Uuid: uuid
            }
        ]
    };

    return xml(xmlMessage, { declaration: true });
}

export function error(message) {
    const xmlMessage = {
        Error: [
            {
                Message: message
            }
        ]
    };

    return xml(xmlMessage, { declaration: true });
}
