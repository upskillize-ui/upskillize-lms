const Redis = require("ioredis");

let redis = null;

try {
  redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
    maxRetriesPerRequest: null,
    lazyConnect: true,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 100, 3000);
    },
    connectTimeout: 5000,
  });

  redis.on("connect", () => console.log("[Redis] ✅ Connected"));
  redis.on("error", (err) =>
    console.warn("[Redis] ⚠️ Not available:", err.message),
  );
} catch (e) {
  console.warn("[Redis] ⚠️ Failed to initialize:", e.message);
  redis = null;
}

// 👇 Add here — triggers the connection immediately on startup
if (redis) {
  redis.connect().catch((err) => {
    console.warn("[Redis] ⚠️ Could not connect:", err.message);
  });
}

module.exports = redis;
