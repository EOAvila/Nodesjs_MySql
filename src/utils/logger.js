////////////////////////////////////////////////////
// logger.js
///////////////////////////////////////////////////
const logger = {

    info: (...args) => {
        console.log('[INFO]', ...args);
    },

    warn: (...args) => {
        console.warn('[WARN]', ...args);
    },

    error: (...args) => {
        console.error('[ERROR]', ...args);
    }
};
//////////////////////////////////////////////////
export const logger = (message) => (
    console.log(
        `{${new Date(), toISOString()}] ${message}`
    )
)

export default logger;
