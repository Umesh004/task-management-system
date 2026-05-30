import { redisClient } from "../lib/redis";

export const invalidateTaskCache = async (organizationId: string) => {
  const keys = await redisClient.keys(`tasks:${organizationId}:*`);

  if (keys.length) {
    await redisClient.del(keys);

    console.log(`Invalidated task cache for org ${organizationId}`);
  }
};
