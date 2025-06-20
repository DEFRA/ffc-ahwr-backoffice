import { setup } from "./insights.js";
import { createServer } from "./server.js";

let server;
const init = async () => {
  console.log("Running application insights setup");
  setup();
  console.log("Creating server");
  server = await createServer();
  console.log("Server created, starting...");
  await server.start();
  console.log("Server started");
};

process.on("unhandledRejection", async (err) => {
  await server.stop();
  server.logger.error(err, "unhandledRejection");
  process.exit(1);
});

process.on("SIGINT", async () => {
  await server.stop();
  process.exit(0);
});

init();
