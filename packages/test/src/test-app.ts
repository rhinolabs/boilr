import { createApp, type BoilrInstance } from "@rhinolabs/boilr";
import type { TestAppConfig, TestContext } from "./types.js";

export async function createTestApp(config: TestAppConfig = {}): Promise<TestContext> {
  const defaultTestConfig = {
    server: {
      logger: config.silent !== false ? false : config.server?.logger,
      ...config.server
    },
    plugins: {
      swagger: false,
      monitor: false,
      ...config.plugins
    },
    ...config
  };

  if (config.database?.setup) {
    await config.database.setup();
  }

  const app = createApp(defaultTestConfig);

  await app.ready();

  const cleanup = async () => {
    try {
      await app.close();
      if (config.database?.teardown) {
        await config.database.teardown();
      }
    } catch (error) {
      console.error('Error during test cleanup:', error);
    }
  };

  return {
    app,
    cleanup
  };
}

export async function withTestApp<T>(
  config: TestAppConfig = {},
  callback: (app: BoilrInstance) => Promise<T>
): Promise<T> {
  const { app, cleanup } = await createTestApp(config);
  
  try {
    return await callback(app);
  } finally {
    await cleanup();
  }
}