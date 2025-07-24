import bcryptjs from "bcryptjs";

async function hash(password) {
  const rounds = getRounds();
  return await bcryptjs.hash(password, rounds);
}

function getRounds() {
  return process.env.NODE_ENV === "production" ? 14 : 1;
}

async function compare(password1, password2) {
  return await bcryptjs.compare(password1, password2);
}

const password = {
  hash,
  compare,
};

export default password;
