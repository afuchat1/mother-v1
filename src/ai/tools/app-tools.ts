'use server';
/**
 * @fileOverview Tools for the AfuAi assistant to interact with the application.
 *
 * - findUser - Finds a user by name.
 * - findProduct - Finds a product by a search query.
 * - browse - Fetches and parses the text content of a given URL.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { parse } from 'node-html-parser';
import { getFirestore } from 'firebase-admin/firestore';
import { getApps, initializeApp, cert } from 'firebase-admin/app';

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  try {
    // Try to initialize with service account from environment variables
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
    initializeApp({
      credential: cert(serviceAccount)
    });
  } catch(e) {
    console.warn("Could not initialize Firebase Admin SDK. AI Tools requiring database access will not work.", e);
  }
}

const db = getFirestore();

export const findUser = ai.defineTool(
  {
    name: 'findUser',
    description: 'Finds a user in the application by their name to retrieve their profile and activities.',
    inputSchema: z.object({
      name: z.string().describe('The name of the user to find.'),
    }),
    outputSchema: z.object({
      found: z.boolean(),
      id: z.string().optional(),
      name: z.string().optional(),
      avatarUrl: z.string().optional(),
      productsSoldCount: z.number().optional(),
    }),
  },
  async ({ name }) => {
    console.log(`[findUser] Searching for: ${name}`);
    try {
      const usersRef = db.collection('users');
      // Using '==' for an exact match on the name. Firestore is case-sensitive.
      const snapshot = await usersRef.where('name', '==', name).limit(1).get();

      if (snapshot.empty) {
        return { found: false };
      }

      const userDoc = snapshot.docs[0];
      const userData = userDoc.data();

      // Get count of products sold by this user
      const productsSnapshot = await db.collection('afuMallListings').where('sellerId', '==', userDoc.id).get();

      return {
          found: true,
          id: userDoc.id,
          name: userData.name,
          avatarUrl: userData.avatarUrl,
          productsSoldCount: productsSnapshot.size,
      };
    } catch (error) {
        console.error('[findUser] Error:', error);
        return { found: false };
    }
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
      try {
        // Firestore does not support case-insensitive search natively.
        // A common workaround is to store a lower-case version of searchable fields.
        // For this demo, we'll fetch all and filter, which is not scalable.
        const productsRef = db.collection('afuMallListings');
        const snapshot = await productsRef.get();
        
        const lowercasedQuery = query.toLowerCase();
        const foundProducts: any[] = [];

        snapshot.forEach(doc => {
            const product = doc.data();
            if (
                product.name.toLowerCase().includes(lowercasedQuery) ||
                product.description.toLowerCase().includes(lowercasedQuery)
            ) {
                foundProducts.push({ id: doc.id, ...product });
            }
        });

        return foundProducts.map(({ id, name, description, price }) => ({ id, name, description, price }));

      } catch (error) {
        console.error('[findProduct] Error:', error);
        return [];
      }
    }
);

export const browse = ai.defineTool(
  {
    name: 'browse',
    description: 'Fetches the text content of a public webpage.',
    inputSchema: z.object({
      url: z.string().describe('The URL of the webpage to fetch.'),
    }),
    outputSchema: z.string(),
  },
  async ({ url }) => {
    console.log(`[browse] Fetching content from: ${url}`);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        return `Error: Unable to fetch content. Status code: ${response.status}`;
      }
      const html = await response.text();
      const root = parse(html);
      // Remove script and style tags to clean up the text
      root.querySelectorAll('script, style, noscript').forEach(el => el.remove());
      // Return the text content, which strips all HTML tags
      return root.textContent || 'Could not extract text content from the page.';
    } catch (e: any) {
      console.error(`[browse] Error fetching ${url}:`, e.message);
      return `Error: Could not fetch the URL. ${e.message}`;
    }
  }
);
