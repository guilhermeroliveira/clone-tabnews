import errorHandler from "infra/errors/error-handler";
import user from "model/user";
import { createRouter } from "next-connect";

const router = createRouter();

router.post(postHandler);

async function postHandler(request, response) {
  const { body } = request;
  const newUser = await user.create(body);
  return response.status(201).json(newUser);
}

export default router.handler(errorHandler);
