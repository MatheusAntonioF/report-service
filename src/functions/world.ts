import { response } from "../utils/response";

export async function handler(event) {
    return response(200, {
        message: "World!",
    });
}
