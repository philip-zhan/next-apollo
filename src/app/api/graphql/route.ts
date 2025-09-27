import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { ApolloServer } from "@apollo/server";
import { NextRequest } from "next/server";
import { gql } from "graphql-tag";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { eq, isNull } from "drizzle-orm";

// TypeScript types for GraphQL context
interface Context {
  req: NextRequest;
}

// TypeScript types for resolvers
interface User {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

const typeDefs = gql`
  type User {
    id: Int!
    createdAt: String!
    updatedAt: String!
    deletedAt: String
  }

  type Query {
    hello: String
    users: [User!]!
    user(id: Int!): User
  }

  type Mutation {
    createUser: User!
    updateUser(id: Int!): User
    deleteUser(id: Int!): Boolean!
  }
`;

const resolvers = {
  Query: {
    hello: () => "Hello world!",
    users: async (): Promise<User[]> => {
      const allUsers = await db.select().from(users).where(isNull(users.deleted_at));
      return allUsers.map(user => ({
        id: user.id,
        createdAt: user.created_at.toISOString(),
        updatedAt: user.updated_at.toISOString(),
        deletedAt: user.deleted_at?.toISOString() || null,
      }));
    },
    user: async (_: any, { id }: { id: number }): Promise<User | null> => {
      const user = await db.select().from(users).where(eq(users.id, id)).limit(1);
      if (user.length === 0) return null;
      
      const foundUser = user[0];
      return {
        id: foundUser.id,
        createdAt: foundUser.created_at.toISOString(),
        updatedAt: foundUser.updated_at.toISOString(),
        deletedAt: foundUser.deleted_at?.toISOString() || null,
      };
    },
  },
  Mutation: {
    createUser: async (): Promise<User> => {
      const newUser = await db.insert(users).values({}).returning();
      const user = newUser[0];
      return {
        id: user.id,
        createdAt: user.created_at.toISOString(),
        updatedAt: user.updated_at.toISOString(),
        deletedAt: user.deleted_at?.toISOString() || null,
      };
    },
    updateUser: async (_: any, { id }: { id: number }): Promise<User | null> => {
      const updatedUser = await db
        .update(users)
        .set({ updated_at: new Date() })
        .where(eq(users.id, id))
        .returning();
      
      if (updatedUser.length === 0) return null;
      
      const user = updatedUser[0];
      return {
        id: user.id,
        createdAt: user.created_at.toISOString(),
        updatedAt: user.updated_at.toISOString(),
        deletedAt: user.deleted_at?.toISOString() || null,
      };
    },
    deleteUser: async (_: any, { id }: { id: number }): Promise<boolean> => {
      const deletedUser = await db
        .update(users)
        .set({ deleted_at: new Date() })
        .where(eq(users.id, id))
        .returning();
      
      return deletedUser.length > 0;
    },
  },
};

const server = new ApolloServer<Context>({
  typeDefs,
  resolvers,
});

// Typescript: req has the type NextRequest
const handler = startServerAndCreateNextHandler<NextRequest, Context>(server, {
  context: async (req) => ({ req }),
});

export { handler as GET, handler as POST };
