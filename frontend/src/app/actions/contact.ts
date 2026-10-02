"use server"

export async function getWeb3FormsKey() {
    return process.env.WEB3FORMS_ACCESS_KEY || "";
}
