const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { resolveObjMapThunk } = require("graphql");
const { v1: uuid } = require("uuid");

let authors = [
  {
    name: "Robert Martin",
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: "Martin Fowler",
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963,
  },
  {
    name: "Fyodor Dostoevsky",
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821,
  },
  {
    name: "Joshua Kerievsky", // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  {
    name: "Sandi Metz", // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
];

let books = [
  {
    title: "Clean Code",
    published: 2008,
    author: "Robert Martin",
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"],
  },
  {
    title: "Agile software development",
    published: 2002,
    author: "Robert Martin",
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ["agile", "patterns", "design"],
  },
  {
    title: "Refactoring, edition 2",
    published: 2018,
    author: "Martin Fowler",
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"],
  },
  {
    title: "Refactoring to patterns",

    published: 2008,
    author: "Joshua Kerievsky",
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "patterns"],
  },
  {
    title: "Practical Object-Oriented Design, An Agile Primer Using Ruby",
    published: 2012,
    author: "Sandi Metz",
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "design"],
  },
  {
    title: "Crime and punishment",
    published: 1866,
    author: "Fyodor Dostoevsky",
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "crime"],
  },
  {
    title: "Demons",
    published: 1872,
    author: "Fyodor Dostoevsky",
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "revolution"],
  },
];

/*
  you can remove the placeholder query once your first one has been implemented 
*/

const typeDefs = `
  type author {
    id : ID!
    born : String
    name: String!
    bookCount: Int!
  }

  type book {
    title : String!
    published: Int!
    author : String!
    genres : [String!]!
    id : ID!

  }
  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks (author : String, genre : String) : [book]
    allAuthors : [author]
  }

  type Mutation {
    addBook( 
    title : String!
    published : Int!
    genres : [String!]!
    author : String!
    ) : book!
    editAuthor(name: String! , setBornTo:Int!) : author
  }
`;

const resolvers = {
  Query: {
    bookCount: () => books.length,
    authorCount: () => authors.length,
    allBooks: (root, args) => {
      let res;
      if (args.author && args.genre) {
        res = books.filter(
          (book) =>
            book.author === args.author && book.genres.includes(args.genre),
        );
      } else {
        if (args.author) {
          res = books.filter((book) => book.author === args.author);
        } else {
          if (args.genre) {
            res = books.filter((book) => book.genres.includes(args.genre));
          } else {
            res = books;
          }
        }
      }

      return res;
    },
    allAuthors: () => authors,
  },
  author: {
    bookCount: (root) =>
      books.filter((book) => book.author === root.name).length,
  },
  Mutation: {
    addBook: (root, args) => {
      let newBook = {
        ...args,
      };

      books = books.concat(newBook);
      isNewAuthor = !authors.some((author) => author.name === args.author);
      if (isNewAuthor) {
        authors = authors.concat({
          name: args.author,
          id: uuid(),
          born: args.born,
        });
      }
      return newBook;
    },
    editAuthor: (root, args) => {
      authorToBeEdited = authors.find((author) => author.name === args.name);
      if (!authorToBeEdited) {
        return;
      }
      editedAuthor = { ...authorToBeEdited, born: args.setBornTo };
      authors = authors.map((author) =>
        author.name === args.name ? editedAuthor : author,
      );
      return editedAuthor;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
