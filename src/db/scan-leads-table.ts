import { ScanCommand, type AttributeValue } from "@aws-sdk/client-dynamodb";

import { dynamoClient } from "../clients/dynamo-client";
import { env } from "../config/env";

export async function* scanLeadsTable() {
    let lastEvaluatedKey: Record<string, AttributeValue> | undefined;

    do {
        const command = new ScanCommand({
            TableName: env.DYNAMO_LEADS_TABLE,
        });

        const { Items, LastEvaluatedKey } = await dynamoClient.send(command);

        lastEvaluatedKey = LastEvaluatedKey;

        yield Items;
    } while (lastEvaluatedKey);
}
