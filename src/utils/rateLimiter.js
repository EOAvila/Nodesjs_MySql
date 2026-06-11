////////////////////////////////////////////
// rateLimiter
////////////////////////////////////////////
import rateLimit from "express-rate-limit";

const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false
});

export default rateLimiter;
/*
const sleep = (ms) =>
    new Promise(
        resolve => setTimeout(resolve, ms)
    );

let lastRequest = 0;

export const rateLimitBitrix = async () => {

    const now = Date.now();

    const diff =
        now - lastRequest;

    if (diff < 350) {

        await sleep(
            350 - diff
        );
    }

    lastRequest = Date.now();
};

export { sleep };
*/