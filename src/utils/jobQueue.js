const queue = [];

export const addJob = (job) => {
    queue.push(job);
};

export const processQueue = async (handler) => {
    while (true) {
        const job = queue.shift();

        if (!job) {
            await new Promise(r => setTimeout(r, 500));
            continue;
        }

        try {
            await handler(job);
        } catch (err) {
            console.error("JOB ERROR:", err);

            // reintento simple
            setTimeout(() => queue.push(job), 5000);
        }
    }
};