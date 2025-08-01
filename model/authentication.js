import { NotFoundError, UnauthorizedError } from "infra/errors/errors";
import password from "model/password";
import user from "model/user";

async function findUserByEmail(email) {
  try {
    return await user.findOneByEmail(email);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new UnauthorizedError({
        message: "Incorrect email.",
        action: "Check the data and try again.",
      });
    }

    throw error;
  }
}

async function validatePassword(inputPassword, storedPassword) {
  const correctPasswordMatch = await password.compare(inputPassword, storedPassword);
  if (!correctPasswordMatch) {
    throw new UnauthorizedError({
      message: "Incorrect password.",
      action: "Check the data and try again.",
    });
  }
}

async function authenticateUser(authData) {
  try {
    const storedUser = await findUserByEmail(authData.email);
    await validatePassword(authData.password, storedUser.password);

    return storedUser;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Authentication data invalid.",
        action: "Check the data and try again.",
      });
    }

    throw error;
  }
}

const authentication = {
  authenticateUser,
};

export default authentication;
