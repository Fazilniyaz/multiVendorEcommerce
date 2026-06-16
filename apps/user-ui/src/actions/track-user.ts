"use server";

import { kafkaClient } from "@packages/utils/kafka";

export async function sendKafkaEvent(eventData: {
    userId?: string;
    productId?: string;
    shopId?: string;
    action: string;
    device?: string;
    country?: string;
    city?: string;
}) {
    // A new producer is created per-call so that the stateless server action
    // does not share a long-lived connection across requests.

    console.log(eventData, "Sending Kafka event for action:", eventData.action);

    const producer = kafkaClient.producer();
    try {
        await producer.connect();
        await producer.send({ 
            topic: "checkout",
            messages: [
                {
                    value: JSON.stringify(eventData),
                },
            ],
        });
        console.log("Event sent to Kafka:", eventData);
    } catch (error) {
        console.error("Error sending event to Kafka:", error);
    } finally {
        await producer.disconnect();
    }
}
