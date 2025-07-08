const Redis = require('ioredis')

const redis = new Redis(process.env.REDISCLOUD_URL || 'redis://127.0.0.1:6379');


const limitLoginMiddleware = async (req , res , next) => {
    const max_attemps = 5;

    const ip = req.ip;
    const key = `login_attemps:${ip}`;

    const attempts = await redis.get(key);


    if(attempts && parseInt(attempts) >= max_attemps) {
        return res.status(429).json({message : 'محاولات تسجيل دخول فاشلة متعددة من نفس الجهاز  المرجو المحاولة مرة اخرى بعد 5 دقاءق'})
    }

    req.rateLimitKey = key;
    next()
}

module.exports = {limitLoginMiddleware}