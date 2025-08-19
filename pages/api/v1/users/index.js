import controller from "infra/controller";
import user from "model/user";
import { createRouter } from "next-connect";

const router = createRouter();

router.post(postHandler);

async function postHandler(request, response) {
  const { body } = request;
  const newUser = await user.create(body);
  return response.status(201).json(newUser);
}

export default router.handler(controller.errorHandlers);
