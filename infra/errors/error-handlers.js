import {
  ConflictError,
  InternalServerError,
  MethodNotAllowedError,
  NotFoundError,
} from "infra/errors/errors";

export function handleMethodNotAllowed(_, response) {
  response.status(405).json(new MethodNotAllowedError());
}

export function handleUncaughtError(error, _, response) {
  if (error instanceof ConflictError || error instanceof NotFoundError) {
    return response.status(error.statusCode).json(error);
  }

  const publicError = new InternalServerError({
    cause: error,
    statusCode: error.statusCode,
  });
  console.error(publicError);
  response.status(publicError.statusCode).json(publicError);
}

const errorHandler = {
  onNoMatch: handleMethodNotAllowed,
  onError: handleUncaughtError,
};

export default errorHandler;
