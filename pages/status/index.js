import useSWR from "swr";

async function fetchAPI() {
  const response = await fetch("/api/v1/status");
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
      <br />
      <Services />
    </>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let updatedAtText = "Loading...";

  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
  }

  return <div>Last update: {updatedAtText}</div>;
}

function Services() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  if (!isLoading && data) {
    let services;
    for (let service in data.dependencies) {
      services = (
        <li key={service}>
          {service}:
          <ul>
            {Object.keys(data.dependencies[service]).map(key => (
              <li key={`${service}.${key}`}>
                {key}: {data.dependencies[service][key]}
              </li>
            ))}
          </ul>
        </li>
      );
    }

    return (
      <div>
        Services:
        <ul>{services}</ul>
      </div>
    );
  }

  return <div>Services: Loading...</div>;
}
