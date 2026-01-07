const { RateLimiterRedis } = require('rate-limiter-flexible');
const redisClient = require('../config/redis');

// Helper to create middleware
const createRateLimiter = (options, errorMessage = 'Too Many Requests') => {
    const limiter = new RateLimiterRedis({
        storeClient: redisClient,
        keyPrefix: options.keyPrefix || 'middleware',
        points: options.points,
        duration: options.duration,
    });

    return (req, res, next) => {
        limiter.consume(req.ip)
            .then(() => {
                next();
            })
            .catch((err) => {
                if (err instanceof Error) {
                    console.error('[RateLimiter Error]', err);
                    // If Redis is down, we might want to fail open or closed. Currently closed (429).
                }
                res.status(429).json({ error: errorMessage, details: err.message || 'Rate limit exceeded' });
            });
    };
};

// Global Limiter: 100 requests per 15 mins (900 seconds)
const globalLimiter = createRateLimiter({
    keyPrefix: 'rate_limit_global',
    points: 100,
    duration: 15 * 60, // 15 minutes
});

// Strict Auth Limiter: 10 requests per 15 mins
const authLimiter = createRateLimiter({
    keyPrefix: 'rate_limit_auth',
    points: 10,
    duration: 15 * 60,
}, 'Too many login attempts. Please try again later.');

module.exports = {
    globalLimiter,
    authLimiter
};
