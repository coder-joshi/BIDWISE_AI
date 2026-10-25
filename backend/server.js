import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/common/config/db.js";
import { startWorker, stopWorker } from "./src/modules/jobs/worker.js";

const PORT = process.env.PORT || 4000;

const start = async () => {
  // Connect to DB
  await connectDB();

  // Start in-process background job queue worker
  startWorker();

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `Server is running at PORT: ${PORT} in ${process.env.NODE_ENV} mode`,
    );
  });

  const shutdown = async (signal) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      console.log("HTTP server closed.");
      await stopWorker();
      process.exit(0);
    });
  };

  process.once("SIGTERM", () => shutdown("SIGTERM"));
  process.once("SIGINT", () => shutdown("SIGINT"));
};

start().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
