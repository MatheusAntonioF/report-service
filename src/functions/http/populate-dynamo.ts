import { randomUUID } from "node:crypto";
import { faker } from "@faker-js/faker";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";

import { env } from "../../config/env";
import { dynamoClient } from "../../clients/dynamo-client";
import { response } from "../../utils/response";

export async function handler() {
    const total = 5000;

    const responses = await Promise.allSettled(
        Array.from({ length: total }, async () => {
            const user = {
                id: randomUUID(),
                name: faker.person.fullName(),
                email: faker.internet.email().toLowerCase(),
                jobTitle: faker.person.jobTitle(),
            };

            const command = new PutItemCommand({
                TableName: env.DYNAMO_LEADS_TABLE,
                Item: {
                    id: { S: user.id },
                    name: { S: user.name },
                    email: { S: user.email },
                    jobTitle: { S: user.jobTitle },
                },
            });

            await dynamoClient.send(command);
        })
    );

    const totalCreatedLeads = responses.filter((item) => {
        return item.status === "fulfilled";
    }).length;

    return response(201, { totalCreatedLeads });
}
