import { request } from "./request.js";

interface MeUser {
  id: string;
  name: string;
  email: string;
}

export async function getMe() {
  return (await request({
    shouldUseGlobal: true,
    query: `
      query CliMeQuery {
        me {
          id
          name
          email
        }
      }
    `
  }))?.data?.me as MeUser;
}