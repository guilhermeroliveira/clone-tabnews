import retry from "async-retry";

async function waitForAllServices() {
  await waitForWebServer();
}

async function waitForWebServer() {
  const fetchStatus = async (bail, attempt) => {
    const response = await fetch("http://localhost:3000/api/v1/status");
    if (!response.ok)
      throw new Error();
  };

  return retry(fetchStatus, {
    retries: 100,
    maxTimeout: 1000
  });
}

export default {
  waitForAllServices
}
