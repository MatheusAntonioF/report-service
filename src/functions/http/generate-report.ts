import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { SendMessageCommand } from "@aws-sdk/client-sqs";

import { sqsClient } from "../../clients/sqs-client";
import { response } from "../../utils/response";
import { env } from "../../config/env";

export async function handler(event: APIGatewayProxyEventV2) {
    const { userId, filters } = JSON.parse(event.body || "");

    const command = new SendMessageCommand({
        QueueUrl: env.GENERATE_REPORT_QUEUE_URL,
        MessageBody: JSON.stringify({ userId, filters }),
    });

    await sqsClient.send(command);

    return response(200, {
        message:
            "The report is being generated. You will receive it in your email",
    });
}
