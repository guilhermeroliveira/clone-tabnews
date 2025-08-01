import * as errors from "infra/errors/errors";

export function handleMethodNotAllowed(_, response) {
  response.status(405).json(new errors.MethodNotAllowedError());
}

export function handleUncaughtError(error, _, response) {
  if (
    !(error instanceof errors.ServiceError) &&
    Object.values(errors).some(err => error instanceof err)
  ) {
    return response.status(error.statusCode).json(error);
  }

  const publicError = new errors.InternalServerError({
    cause: error,
  });
  console.error(publicError);
  response.status(publicError.statusCode).json(publicError);
}

const errorHandler = {
  onNoMatch: handleMethodNotAllowed,
  onError: handleUncaughtError,
};

export default errorHandler;
