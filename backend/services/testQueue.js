/**
 * services/testQueue.js
 *
 * BullMQ queue for AI test generation.
 * - Limits concurrent AI calls to 20 (protects against 429 rate limits)
 * - Auto-retries on failure (3 attempts, exponential backoff)
 * - QueueEvents exported so testgen.js can await job completion
 */

const { Queue, Worker, QueueEvents } = require("bullmq");
const axios = require("axios");
const redis = require("./redis");

const AGENT =
  process.env.MOCK_TEST_AGENT_URL || "https://upskill25-myagent.hf.space";

// ── Queue ──────────────────────────────────────────────────────────────────────
const testQueue = new Queue("test-generation", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: 100, // keep last 100 completed jobs for debugging
    removeOnFail: 200, // keep last 200 failed jobs
  },
});

// ── QueueEvents — needed for job.waitUntilFinished() in testgen.js ─────────────
const queueEvents = new QueueEvents("test-generation", {
  connection: redis,
});

// ── Worker — max 20 simultaneous AI calls ─────────────────────────────────────
const worker = new Worker(
  "test-generation",
  async (job) => {
    console.log(
      `[Queue] Processing job=${job.id} student=${job.data.student_id}`,
    );
    const { data } = await axios.post(`${AGENT}/api/generate-test`, job.data, {
      timeout: 90_000,
    });
    return data;
  },
  {
    connection: redis,
    concurrency: 20, // ✅ Max 20 simultaneous AI calls — prevents 429 errors
  },
);

// ── Worker events ──────────────────────────────────────────────────────────────

worker.on("completed", (job) => {
  console.log(
    `[Queue] ✅ Job completed: id=${job.id} student=${job.data?.student_id}`,
  );
});

worker.on("failed", (job, err) => {
  console.error(
    `[Queue] ❌ Job failed: id=${job?.id} student=${job?.data?.student_id} error=${err.message}`,
  );
});

worker.on("stalled", (jobId) => {
  console.warn(`[Queue] ⚠️  Job stalled: id=${jobId}`);
});

// ── Exports ────────────────────────────────────────────────────────────────────
module.exports = { testQueue, queueEvents, worker };
