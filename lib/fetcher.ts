import axios from "axios";

export const axiosGraphQL = axios.create({
  baseURL: "http://localhost:3000/api/graphql",
  method: "POST",
  headers: { "content-type": "application/json" },
});

axiosGraphQL.interceptors.request.use(
  function (config) {
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

axiosGraphQL.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    return Promise.reject(error);
  }
);
