// "users/[id].ts", "users/index.ts", "api/index.ts", "(admin)/settings.ts", "routes/[...catchAll].ts"
export const files = [
  {
    name: "users/[id].ts",
    code: `// routes/api/users/[id].ts
import { z } from 'zod';
import {
  type GetHandler,
  defineSchema,
  NotFoundException,
} from "@boilrjs/core";
​
// !focus(1:14)
export const schema = defineSchema({
  get: {
    params: z.object({
      id: z.string().transform(val => parseInt(val, 10))
    }),
    response: {
      200: z.object({
        id: z.number(),
        name: z.string(),
        email: z.string().email()
      })
    }
  }
});
​
export const get: GetHandler<typeof schema> = async (request) => {
  const { id } = request.params; // Automatically typed as number
  
  const user = await getUserById(id);
  
  if (!user) {
    throw new NotFoundException(\`User with id \${id} not found\`);
  }
  
  return user; // Return type automatically validated
};`,
  },
  {
    name: "users/index.ts",
    code: `// routes/api/users/index.ts
import { z } from 'zod';
import { type GetHandler, defineSchema } from '@boilrjs/core';
​
// !focus(1:11)
export const schema = defineSchema({
  get: {
    response: {
      200: z.array(z.object({
        id: z.number(),
        name: z.string(),
        email: z.string().email()
      }))
    }
  }
});
​
export const get: GetHandler<typeof schema> = async () => {
  const users = await getAllUsers();
  return users; // Return type automatically validated
};`,
  },
  {
    name: "api/index.ts",
    code: `// routes/api/index.ts
import { z } from 'zod';
import { type GetHandler, defineSchema } from '@boilrjs/core';
​
// !focus(1:9)
export const schema = defineSchema({
  get: {
    response: {
      200: z.object({
        status: z.string()
      })
    }
  }
});
​
export const get: GetHandler<typeof schema> = async () => {
  return { status: 'API is running' }; // Return type automatically validated
};`,
  },
  {
    name: "(admin)/settings.ts",
    code: `// routes/(admin)/settings.ts
import { z } from 'zod';
import { type GetHandler, defineSchema } from '@boilrjs/core';
​
// !focus(1:10)
export const schema = defineSchema({
  get: {
    response: {
      200: z.object({
        siteName: z.string(),
        maintenanceMode: z.boolean()
      })
    }
  }
});
​
export const get: GetHandler<typeof schema> = async () => {
  const settings = await getAdminSettings();
  return settings; // Return type automatically validated
};`,
  },
  {
    name: "routes/[...catchAll].ts",
    code: `// routes/[...catchAll].ts
import { z } from 'zod';
import { type GetHandler, defineSchema } from '@boilrjs/core';
​
// !focus(1:12)
export const schema = defineSchema({
  get: {
    params: z.object({
      catchAll: z.array(z.string())
    }),
    response: {
      200: z.object({
        message: z.string()
      })
    }
  }
});
​
export const get: GetHandler<typeof schema> = async (request) => {
  const { catchAll } = request.params; // Automatically typed as string[]
  
  return { message: \`You requested the path: /\${catchAll.join('/')}\` }; // Return type automatically validated
};`,
  },
  {
    name: "src/server.ts",
    code: `// server.ts
import { createApp } from '@boilrjs/core';

const app = createApp({
  server: {
    port: 3000
  },
  plugins: {
  // !focus(1:7)
    swagger: {
      info: {
        title: 'My API',
        description: 'API built with Boilr',
        version: '1.0.0'
      }
    }
  }
});

app.start(); // Documentation available at /docs`,
  },
];
