import jwt from "jsonwebtoken";
import SwaggerParser from "@apidevtools/swagger-parser";

const isSchemaValid = async (url: string) => {
  try {
    const api = await SwaggerParser.parse(url);

    return !!api.title;
  } catch (error) {
    console.error("Invalid Schema", error);
  }
  return false;
};

export const parseSchema = async (url: string) => {
  const isValid = isSchemaValid(url);

  if (!isValid) {
    console.warn("OpenAPI Schema is not valid");
    return;
  }

  const api = await SwaggerParser.dereference(url);
  return api;
};

export const buildUrl = (
  url: string,
  accountId: string | null,
  userId: string | null
) => url.replace(":ACCOUNT-ID", accountId).replace(":USER-ID", userId);

type ParsedResponse = {
  status: number;
  ok: boolean;
  json: any;
};

export const parseResponse = (response: Response) => {
  return new Promise<ParsedResponse>((resolve) => {
    response.text().then((body) => {
      resolve({
        status: response.status,
        ok: response.ok,
        json: body !== "" ? JSON.parse(body) : "{}",
      });
    });
  });
};

export const isTokenInvalid = (token: string) => {
  try {
    const { exp: expiration = null } = jwt.decode(token);
    const currentTimestamp = Math.ceil(new Date().getTime() / 1000);
    const expirationBuffer = 10;
    const expirationTimestamp = expiration - expirationBuffer;

    if (currentTimestamp >= expirationTimestamp) {
      return true;
    }

    return false;
  } catch (_) {
    return true;
  }
};

export const camelToSnakeCase = (str: string) =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
