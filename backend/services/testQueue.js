// services/testQueue.js
const { Queue, Worker } = require("bullmq");
const axios = require("axios");
const redis = require("./redis");

const AGENT = process.env.MOCK_TEST_AGENT_URL;

// The queue — all generate requests go here
const testQueue = new Queue("test-generation", { connection: redis });

// Worker — only 20 jobs run at once, ever
const worker = new Worker(
  "test-generation",
  async (job) => {
    const { data } = await axios.post(`${AGENT}/api/generate-test`, job.data, {
      timeout: 90000,
    });
    return data;
  },
  {
    connection: redis,
    concurrency: 20, // max 20 simultaneous Claude calls
  },
);

worker.on("failed", (job, err) => {
  console.error(`[Queue] Job ${job.id} failed:`, err.message);
});

module.exports = { testQueue };
