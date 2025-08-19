import * as cookie from "cookie";
import * as errors from "infra/errors/errors";
import session from "model/session";

export function handleMethodNotAllowed(_, response) {
  response.status(405).json(new errors.MethodNotAllowedError());
}

export function handleUncaughtError(error, _, response) {
  if (
    !(error instanceof errors.ServiceError) &&
    Object.values(errors).some(err => error instanceof err)
  ) {
    return response.status(error.statusCode).json(error);
  }

  const publicError = new errors.InternalServerError({
    cause: error,
  });
  console.error(publicError);
  response.status(publicError.statusCode).json(publicError);
}

async function setSessionCookie(sessionToken, responseObject) {
  const sessionCookie = cookie.serialize("session_id", sessionToken, {
    path: "/",
    maxAge: session.EXPIRATION_IN_MILLIS / 1000,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  responseObject.setHeader("Set-Cookie", sessionCookie);
}

const controller = {
  errorHandlers: {
    onNoMatch: handleMethodNotAllowed,
    onError: handleUncaughtError,
  },
  setSessionCookie,
};

export default controller;
