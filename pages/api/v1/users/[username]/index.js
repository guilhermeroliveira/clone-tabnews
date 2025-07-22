import errorHandler from "infra/errors/error-handlers";
import user from "model/user";
import { createRouter } from "next-connect";

const router = createRouter();

router.get(getHandler);

async function getHandler(request, response) {
  const username = request.query.username;

  const foundUser = await user.findOneByUsername(username);

  return response.status(200).json(foundUser);
}

export default router.handler(errorHandler);
