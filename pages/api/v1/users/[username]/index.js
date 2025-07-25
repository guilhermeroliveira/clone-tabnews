import errorHandler from "infra/errors/error-handlers";
import user from "model/user";
import { createRouter } from "next-connect";

const router = createRouter();

router.get(getHandler);
router.patch(patchHandler);

async function getHandler(request, response) {
  const username = request.query.username;

  const foundUser = await user.findOneByUsername(username);

  return response.status(200).json(foundUser);
}

async function patchHandler(request, response) {
  const username = request.query.username;
  const userInputValues = request.body;

  const updatedUser = await user.update(username, userInputValues);

  return response.status(200).json(updatedUser);
}

export default router.handler(errorHandler);
