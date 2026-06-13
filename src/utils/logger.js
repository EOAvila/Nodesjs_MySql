////////////////////////////////////////////////////
// logger.js
///////////////////////////////////////////////////
const logger = {
    info: (msg) =>
        console.log(`[INFO ${new Date().toISOString()}] ${msg}`),

    warn: (msg) =>
        console.warn(`[WARN ${new Date().toISOString()}] ${msg}`),

    error: (msg) =>
        console.error(`[ERROR ${new Date().toISOString()}] ${msg}`)
};

///////////////////////////////////
export const log = (...args) => {

    console.log(
        `[${new Date().toISOString()}]`,
        ...args
    );
};

export const logError = (...args) => {

    console.error(
        `[${new Date().toISOString()}]`,
        ...args
    );
};

///////////////////////
export default logger;
