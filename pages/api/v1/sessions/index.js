import controller from "infra/controller";
import authentication from "model/authentication";
import session from "model/session";
import { createRouter } from "next-connect";

const router = createRouter();

router.post(postHandler).delete(deleteHandler);

async function postHandler(request, response) {
  const { body } = request;

  const authenticatedUser = await authentication.authenticateUser(body);

  const newSession = await session.create(authenticatedUser.id);

  controller.setSessionCookie(newSession.token, response);

  return response.status(201).json(newSession);
}

async function deleteHandler(request, response) {
  const sessionToken = request.cookies.session_id;

  const sessionObj = await session.findOneValidByToken(sessionToken);
  const expiredSession = await session.expireById(sessionObj.id);

  controller.clearSessionCookie(response);

  return response.status(200).json(expiredSession);
}

export default router.handler(controller.errorHandlers);
