import app from "./app";
import { env } from "./config/env";
import { connectRedis } from "./lib/redis";

const startServer = async () => {
  try {
    await connectRedis();

    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
};

startServer();
