import type { SQSEvent } from "aws-lambda";
import { paginateScan } from "@aws-sdk/client-dynamodb";

import { dynamoClient } from "../../clients/dynamo-client";
import { env } from "../../config/env";

export async function handler(event: SQSEvent) {
    const paginator = paginateScan(
        {
            client: dynamoClient,
        },
        {
            TableName: env.DYNAMO_LEADS_TABLE,
        }
    );
    for await (const { Count } of paginator) {
    }
}
