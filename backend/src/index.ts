import { createYoga } from 'graphql-yoga';
import { createServer } from 'http';
import { schema } from './schema.js';
import { createContext } from './context.js';

const PORT = process.env.PORT || 4000;

const yoga = createYoga({
  schema,
  context: createContext,
  graphqlEndpoint: '/graphql',
  landingPage: true,
  cors: {
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
});

const server = createServer(yoga);

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}/graphql`);
});
