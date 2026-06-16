// test-kafka.ts
import { kafkaClient } from "./index";

async function test() {
  const admin = kafkaClient.admin();
  await admin.connect();
  console.log("Redpanda Connected...");
  const topics = await admin.listTopics();
  console.log("Topics:", topics);
  await admin.disconnect();
}

test().catch(console.error);