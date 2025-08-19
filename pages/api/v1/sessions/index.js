import controller from "infra/controller";
import authentication from "model/authentication";
import session from "model/session";
import { createRouter } from "next-connect";

const router = createRouter();

router.post(postHandler);

async function postHandler(request, response) {
  const { body } = request;

  const authenticatedUser = await authentication.authenticateUser(body);

  const newSession = await session.create(authenticatedUser.id);

  controller.setSessionCookie(newSession.token, response);

  return response.status(201).json(newSession);
}

export default router.handler(controller.errorHandlers);
