'use server';
/**
 * @fileOverview Tools for the AfuAi assistant to interact with the application.
 *
 * - findUser - Finds a user by name.
 * - findProduct - Finds a product by a search query.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { users, products } from '@/lib/data';

export const findUser = ai.defineTool(
  {
    name: 'findUser',
    description: 'Finds a user in the application by their name to retrieve their profile and activities.',
    inputSchema: z.object({
      name: z.string().describe('The name of the user to find.'),
    }),
    outputSchema: z.object({
      id: z.string(),
      name: z.string(),
      avatarUrl: z.string(),
      bio: z.string().optional(),
      productsSold: z.array(z.object({
          id: z.string(),
          name: z.string(),
          price: z.number(),
      })).optional(),
    }).nullable(),
  },
  async ({ name }) => {
    console.log(`[findUser] Searching for: ${name}`);
    const user = users.find(u => u.name.toLowerCase() === name.toLowerCase());
    if (user) {
        return {
            id: user.id,
            name: user.name,
            avatarUrl: user.avatarUrl,
            bio: user.bio,
            productsSold: user.productsSold?.map(p => ({ id: p.id, name: p.name, price: p.price }))
        };
    }
    return null;
  }
);


export const findProduct = ai.defineTool(
    {
      name: 'findProduct',
      description: 'Finds products in AfuMall by a search query.',
      inputSchema: z.object({
        query: z.string().describe('The search query for the product.'),
      }),
      outputSchema: z.array(
        z.object({
            id: z.string(),
            name: z.string(),
            description: z.string(),
            price: z.number(),
        })
      ),
    },
    async ({ query }) => {
      console.log(`[findProduct] Searching for: ${query}`);
      const lowercasedQuery = query.toLowerCase();
      const foundProducts = products.filter(
        p =>
          p.name.toLowerCase().includes(lowercasedQuery) ||
          p.description.toLowerCase().includes(lowercasedQuery)
      );
      return foundProducts.map(({ id, name, description, price }) => ({ id, name, description, price }));
    }
  );
