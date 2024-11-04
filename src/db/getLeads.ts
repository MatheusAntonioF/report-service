import { paginateScan } from "@aws-sdk/client-dynamodb";

import { dynamoClient } from "../clients/dynamo-client";
import { env } from "../config/env";

export function getLeadsGenerator() {
    const paginator = paginateScan(
        { client: dynamoClient },
        { TableName: env.DYNAMO_LEADS_TABLE }
    );

    return paginator;
}
