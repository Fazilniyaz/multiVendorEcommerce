// import {Kafka } from "kafkajs";

// export const kafkaClient = new Kafka({
//     clientId : "kafka-service",
//     brokers : [""],
//     ssl : true,
//     sasl : {
//         mechanism : "plain",
//         username : process.env.KAFKA_API_KEY!,
//         password : process.env.KAFKA_API_SECRET!
//     }
// })


import { Kafka } from "kafkajs";

import dotenv from "dotenv";
import path from "path";


dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

export const kafkaClient = new Kafka({
  clientId: "kafka-service",
  brokers: [process.env.KAFKA_BOOTSTRAP_SERVER_URL!],
  ssl: {},
  sasl: {
    mechanism: "scram-sha-256",
    username: process.env.KAFKA_USERNAME!,
    password: process.env.KAFKA_PASSWORD!,
  },
});