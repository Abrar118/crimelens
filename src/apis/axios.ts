import axios from "axios";

const Axios = axios.create({
  baseURL: "http://localhost:3000/api/v1",
});

export default Axios;
