import { db } from "./db";

export const savePhantomToken = async (
  phantomToken: string,
  jwtToken: string
): Promise<void> => {
  const expiresIn = new Date();
  expiresIn.setHours(expiresIn.getHours() + 1); // Phantom token expires in 1 hour
  await db`INSERT INTO phantom_tokens (phantom_token, jwt_token, expires_at) VALUES (${phantomToken}, ${jwtToken}, ${expiresIn})`;
};

export const getJwtTokenByPhantomToken = async (
  phantomToken: string
): Promise<string | undefined> => {
  const result =
    await db`SELECT jwt_token FROM phantom_tokens WHERE phantom_token = ${phantomToken}`;
  return result.at(0)?.jwt_token;
};

export const deletePhantomToken = async (
  phantomToken: string
): Promise<void> => {
  await db`DELETE FROM phantom_tokens WHERE phantom_token = ${phantomToken}`;
};
