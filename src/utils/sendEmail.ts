import { Resend } from "resend";
import { env } from "../config/env";

const resend = new Resend(env.RESEND_API_KEY);

interface ISendEmailParams {
    from: string;
    to: string[];
    subject: string;
    text: string;
    html: string;
}

export async function sendEmail({
    from,
    to,
    subject,
    text,
    html,
}: ISendEmailParams) {
    await resend.emails.send({
        from: "Acme <onboarding@resend.dev>",
        to: ["delivered@resend.dev"],
        subject,
        text,
        html,
    });
}
