import * as cookie from "cookie";
import errorHandler from "infra/errors/error-handler";
import authentication from "model/authentication";
import session from "model/session";
import { createRouter } from "next-connect";

const router = createRouter();

router.post(postHandler);

async function postHandler(request, response) {
  const { body } = request;

  const authenticatedUser = await authentication.authenticateUser(body);

  const newSession = await session.create(authenticatedUser.id);

  const sessionCookie = cookie.serialize("session_id", newSession.token, {
    path: "/",
    maxAge: session.EXPIRATION_IN_MILLIS / 1000,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });
  response.setHeader("Set-Cookie", sessionCookie);

  return response.status(201).json(newSession);
}

export default router.handler(errorHandler);
