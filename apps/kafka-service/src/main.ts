import {kafkaClient as Kafka} from "@packages/utils/kafka";
import { updateUserAnalytics } from "./services/analytics.service";

console.log("Kafka consumer service is starting...");

const consumer = Kafka.consumer({ groupId: "user-events-group" });

console.log("Kafka consumer initialized with groupId 'user-events-group'");

const eventQueue: any[] = []; //Temporary event storage, where we plan to store the events before processing them. In a production environment, you would typically use a more robust solution like a message queue or database.

const MAX_RETRIES = 5;
let retryCount = 0;
let isConnected = false;

const processQueue = async () => {
  if (eventQueue.length === 0) return;

  const events = [...eventQueue];
  eventQueue.length = 0; // Clear the queue

  for (const event of events) {
    console.log("Processing event:", event);
    // Here you would add your logic to process the event, such as updating a database, calling another service, etc.

    if (event.action === "shop_visit") {
      //update shop or visitor analytics in database
    }

    const validActions = ["add_to_wishlist", "add_to_cart", "product_view", "remove_from_wishlist", "remove_from_cart", "checkout", "order_placed"];

    if (!event.action || !validActions.includes(event.action)) {
      console.log(`Received event with invalid or missing action: ${event.action}`);
      console.warn(`Received event with invalid or missing action: ${event.action}`);
      continue; // Skip processing this event
    }

    try {
      await updateUserAnalytics(event);
    } catch (error) {
      console.error("Error updating user analytics:", error);
    }
  }
};

//kafka consumer for user events
const consumerKafkaMessages = async () => {
  try {
    console.log("Attempting to connect to Kafka broker...");
    await consumer.connect();
    console.log("Connected to Kafka broker successfully");
    isConnected = true;
    retryCount = 0; // Reset retry count on successful connection

    await consumer.subscribe({ topic: "checkout", fromBeginning: false });
    console.log("Subscribed to 'checkout' topic");

    await consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return; // Skip if no value
        try {
          const event = JSON.parse(message.value.toString());
          eventQueue.push(event);
          console.log("Received event:", event);
          // Here you can add any additional logic you want to perform immediately upon receiving the event, such as logging or basic validation.
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      },
    });
  } catch (error) {
    isConnected = false;
    console.error("Error in Kafka consumer:", error);
    
    // Implement retry logic
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      const delayMs = Math.min(1000 * Math.pow(2, retryCount), 30000); // Exponential backoff, max 30s
      console.log(`Retrying Kafka connection in ${delayMs}ms (attempt ${retryCount}/${MAX_RETRIES})...`);
      setTimeout(consumerKafkaMessages, delayMs);
    } else {
      console.error("Max retries reached. Kafka consumer will not reconnect.");
      process.exit(1);
    }
  }
};

// Start processing events every 3 seconds
const processingInterval = setInterval(processQueue, 3000);

// Start consuming messages from Kafka
consumerKafkaMessages().catch(console.error);

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");
  clearInterval(processingInterval);
  if (isConnected) {
    await consumer.disconnect();
  }
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully...");
  clearInterval(processingInterval);
  if (isConnected) {
    await consumer.disconnect();
  }
  process.exit(0);
});