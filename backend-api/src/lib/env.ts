import dotenv from "dotenv";

dotenv.config();

const DEFAULT_PORT = 3000;
const parsedPort = Number(process.env.PORT);

export const env = {
  port: Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : DEFAULT_PORT
};
