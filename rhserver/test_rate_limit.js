const axios = require('axios');
const Redis = require('ioredis');

const TEST_URL = 'http://localhost:5003/v1/auth/request-otp';
const TOTAL_REQUESTS = 15;

const redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6380,
    enableOfflineQueue: false
});

async function runTest() {
    console.log(`[Setup] Connecting to Redis via ioredis...`);
    // Wait for connection to be ready
    await new Promise((resolve, reject) => {
        redisClient.once('ready', resolve);
        redisClient.once('error', reject);
    });
    console.log('[Setup] Redis Connected!');

    // Clear Rate Limit Keys for clean test
    console.log(`[Setup] Clearing Rate Limit keys...`);
    const styles = ['rate_limit_global*', 'rate_limit_auth*'];

    for (const pattern of styles) {
        // ioredis scan stream or keys
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(keys);
            console.log(`[Setup] Deleted ${keys.length} keys matching ${pattern}`);
        }
    }

    console.log(`\nStarting Rate Limit Test on ${TEST_URL}`);
    console.log(`Sending ${TOTAL_REQUESTS} requests... (Limit should be 10)`);

    for (let i = 1; i <= TOTAL_REQUESTS; i++) {
        try {
            await axios.post(TEST_URL, {
                email: 'varunmathiyalagan@gmail.com', // Unique email to avoid auth-logic blocking (though rate limit is by IP)
                purpose: 'login'
            });
            console.log(`Request ${i}: Success (200)`);
        } catch (error) {
            if (error.response) {
                console.log(`Request ${i}: Failed (${error.response.status}) - ${JSON.stringify(error.response.data)}`);
            } else {
                console.log(`Request ${i}: Error (${error.message})`);
            }
        }
    }

    await redisClient.quit();
}

runTest();
