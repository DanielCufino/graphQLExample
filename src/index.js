import { typeDefs } from './typdefs';
import { resolvers } from './resolvers';

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { json } from 'body-parser';

const mongoose = require('mongoose');

const startServer = async () => {
  // The ApolloServer constructor requires two parameters: your schema
  // definition and your set of resolvers.
  const app = express();
  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await server.start();

  // We connect mongoose to our local mongodb database

  //   const mongoose = require('mongoose');
  //   mongoose.Promise = global.Promise;

  const url = 'mongodb://localhost:27017/graphqldb';

  mongoose.connect(url, { useNewUrlParser: true });
  mongoose.connection.once('open', () =>
    console.log(`Connected to mongo at ${url}`)
  );

  app.use(
    '/graphql',
    cors(),
    json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.token }),
    })
  );

  await new Promise((resolve) =>
    httpServer.listen({ port: 4000 }, resolve)
  );
  console.log(`🚀 Server ready at http://localhost:4000/graphql`);
};

startServer();
