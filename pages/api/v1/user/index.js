import controller from "infra/controller";
import session from "model/session";
import user from "model/user";
import { createRouter } from "next-connect";

const router = createRouter();

router.get(getHandler);

async function getHandler(request, response) {
  const sessionToken = request.cookies.session_id;

  const foundSession = await session.findOneValidByToken(sessionToken);
  const updatedSession = await session.renew(foundSession.id);

  const foundUser = await user.findOneById(foundSession.user_id);

  controller.setSessionCookie(updatedSession.token, response);

  return response.status(200).json(foundUser);
}

export default router.handler(controller.errorHandlers);
