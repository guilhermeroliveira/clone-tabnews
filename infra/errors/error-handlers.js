import { InternalServerError, MethodNotAllowedError } from "infra/errors/errors";

export function handleMethodNotAllowed(_, response) {
  response.status(405).json(new MethodNotAllowedError());
}

export function handleUncaughtError(error, _, response) {
  const publicError = new InternalServerError({
    cause: error,
    statusCode: error.statusCode,
  });
  console.error(publicError);
  response.status(publicError.statusCode).json(publicError);
}

const errorController = {
  onNoMatch: handleMethodNotAllowed,
  onError: handleUncaughtError,
};

export default errorController;
