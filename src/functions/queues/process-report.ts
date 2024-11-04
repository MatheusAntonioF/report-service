import type { SQSEvent } from "aws-lambda";
import { randomUUID } from "crypto";

import { env } from "../../config/env";
import { mbToBytes } from "../../utils/mbToBytest";
import { getLeadsGenerator } from "../../db/getLeads";
import { S3MPUManager } from "../../service/S3MPUManager";
import { getPresignedURL } from "../../utils/getPresignedURL";
import { sendEmail } from "../../utils/sendEmail";

const minChunkSize = mbToBytes(6);

export async function handler(event: SQSEvent) {
    const fileKey = `${new Date().toISOString()}-${randomUUID()}.csv`;

    const mpu = new S3MPUManager(env.REPORTS_BUCKET_NAME, fileKey);

    await mpu.start();

    try {
        const header = "ID, Nome, E-mail, Cargo\n";

        let currentChunk = header;

        for await (const { Items: leads = [] } of getLeadsGenerator()) {
            currentChunk += leads
                .map(
                    (lead) =>
                        `${lead.id.S},${lead.name.S},${lead.email.S},${lead.jobTitle.S}\n`
                )
                .join("");

            const currentChunkSize = Buffer.byteLength(currentChunk, "utf-8");

            if (currentChunkSize <= minChunkSize) continue;

            await mpu.uploadPart(Buffer.from(currentChunk, "utf-8"));

            currentChunk = "";
        }

        if (currentChunk) {
            await mpu.uploadPart(Buffer.from(currentChunk, "utf-8"));
        }

        await mpu.complete();
    } catch (error) {
        await mpu.abort();
    }

    const presignedUrl = await getPresignedURL({
        bucket: env.REPORTS_BUCKET_NAME,
        fileKey,
    });

    await sendEmail({
        from: "Acme <onboarding@resend.dev>",
        to: ["delivered@resend.dev"],
        subject: "O seu relatório já está pronto!",
        text: `Aqui está o seu relatório (a URL é válida apenas por 24h): ${presignedUrl}`,
        html: `
            <h1>Relatório solicitado</h1>
            <br />
            <p>Aqui está o seu relatório (a URL é válida apenas por 24h):
            <br />
            <br />
            <a href="${presignedUrl}">${presignedUrl}</a></p>
        `,
    });
}
