const { Queue, Worker, QueueEvents } = require("bullmq");
const axios = require("axios");
const redis = require("./redis");

let testQueue = null;
let queueEvents = null;
let worker = null;

if (redis) {
  try {
    const AGENT =
      process.env.MOCK_TEST_AGENT_URL || "https://upskill25-myagent.hf.space";

    testQueue = new Queue("test-generation", {
      connection: redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    });

    queueEvents = new QueueEvents("test-generation", { connection: redis });

    worker = new Worker(
      "test-generation",
      async (job) => {
        console.log(
          `[Queue] Processing job=${job.id} student=${job.data.student_id}`,
        );
        const { data } = await axios.post(
          `${AGENT}/api/generate-test`,
          job.data,
          { timeout: 90_000 },
        );
        return data;
      },
      { connection: redis, concurrency: 20 },
    );

    worker.on("completed", (job) => console.log(`[Queue] ✅ Done: ${job.id}`));
    worker.on("failed", (job, err) =>
      console.error(`[Queue] ❌ Failed: ${job?.id}`, err.message),
    );
    worker.on("stalled", (jobId) =>
      console.warn(`[Queue] ⚠️ Stalled: ${jobId}`),
    );

    console.log("[Queue] ✅ BullMQ initialized");
  } catch (e) {
    console.warn("[Queue] ⚠️ BullMQ init failed — queue disabled:", e.message);
    testQueue = null;
    queueEvents = null;
  }
} else {
  console.warn("[Queue] ⚠️ Redis unavailable — falling back to direct axios");
}

module.exports = { testQueue, queueEvents, worker };
