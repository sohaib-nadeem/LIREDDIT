import "reflect-metadata"
import { MikroORM } from "@mikro-orm/core"
import { __prod__ } from "./constants";
//import { Post } from "./entities/Post";
import mikroOrmConfig from "./mikro-orm.config";
import express from 'express'
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import session from "express-session";
import connectPgSimple from 'connect-pg-simple';
import { MyContext } from "./types";


const main = async () => {
    const orm = await MikroORM.init(mikroOrmConfig);
    await orm.getMigrator().up();
    //const emFork = orm.em.fork(); // <-- create the fork
    //const post = emFork.create(Post, {title: "my first post"});
    //await emFork.persistAndFlush(post);
    //const posts = await emFork.find(Post, {});
    //console.log(posts);

    const app = express();
    //app.get('/', (_, res) => {
    //    res.send('hello');
    //})

    app.use(session({
        name: "qid",
        store: new (connectPgSimple(session))({
            disableTouch: true,
            conObject: {
                database: "lireddit", 
                user: "sohaib", 
                host: "/var/run/postgresql", 
                port: 5432
            }
            // Insert connect-pg-simple options here
        }),
        secret: "dffferfervgebbklmdne",
        resave: false,
        saveUninitialized: false,
        cookie: { 
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            httpOnly: true, 
            sameSite: 'lax', //csrf
            secure: __prod__ // cookie only works in https
        } 
        // Insert express-session options here
    }));

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: ({req, res}) => ({em: orm.em, req: req, res: res})
    });

    await apolloServer.start();

    apolloServer.applyMiddleware({ app });

    app.listen(4000, () => {
        console.log('server started on localhost:4000');
    });
}

main().catch((err) => {
    console.error(err);
});

console.log("Hello World!")

