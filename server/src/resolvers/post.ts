import { Post } from "../entities/Post";
import { MyContext } from "src/types";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver {
    @Query(() => [Post])
    getPosts(@Ctx() {em}: MyContext): Promise<Post[]> {
        const emFork = em.fork(); // <-- create the fork
        return emFork.find(Post, {});
    }

    @Query(() => Post, {nullable: true})
    getPost(@Arg('id') id: number, @Ctx() {em}: MyContext): Promise<Post | null> {
        const emFork = em.fork(); // <-- create the fork
        return emFork.findOne(Post, {id});
    }

    @Mutation(() => Post)
    async createPost(@Arg('title') title: string, @Ctx() {em}: MyContext): Promise<Post> {
        const emFork = em.fork(); // <-- create the fork
        const post = emFork.create(Post, {title});
        await emFork.persistAndFlush(post);
        return post;
    }

    @Mutation(() => Post, {nullable: true})
    async updatePost(@Arg('id') id: number, @Arg('title', {nullable: true}) title: string, @Ctx() {em}: MyContext): Promise<Post | null> {
        const emFork = em.fork(); // <-- create the fork
        const post = await emFork.findOne(Post, {id});
        if (!post) {
            return null;
        }
        if (typeof title !== 'undefined') {
            post.title = title;
        }
        await emFork.persistAndFlush(post);
        return post;
    }

    @Mutation(() => Boolean)
    async deletePost(@Arg('id') id: number, @Ctx() {em}: MyContext): Promise<boolean> {
        const emFork = em.fork(); // <-- create the fork
        await emFork.nativeDelete(Post, {id});
        return true;
    }
}