const BASE = "http://localhost:8080/api";

async function request(resource, options = {}) {
let response;

try {
response = await fetch(`${BASE}/${resource}`, {
...options,
headers: {
"Content-Type": "application/json",
...options.headers,
},
});
} catch {
throw new Error(
"Cannot connect to the backend. Make sure your server is running on port 8080."
);
}

if (!response.ok) {
const message = await response.text();
throw new Error(message || `Request failed with status ${response.status}.`);
}

if (response.status === 204) {
return null;
}

const contentType = response.headers.get("content-type") || "";

if (contentType.includes("application/json")) {
return response.json();
}

return null;
}

export const api = {
list: (resource) => request(resource),

get: (resource, id) => request(`${resource}/${id}`),

create: (resource, data) =>
request(resource, {
method: "POST",
body: JSON.stringify(data),
}),

update: (resource, id, data) =>
request(`${resource}/${id}`, {
method: "PUT",
body: JSON.stringify(data),
}),

remove: (resource, id) =>
request(`${resource}/${id}`, {
method: "DELETE",
}),
};
