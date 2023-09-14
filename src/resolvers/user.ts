import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Arg, Query, Mutation,Resolver, Field, InputType, Ctx, ObjectType } from "type-graphql";
import "argon2";
import { hash, verify } from "argon2";
import session from "express-session";

@InputType()
class UsernamePasswordInput {
    @Field() 
    username: string

    @Field() 
    password: string
}

@ObjectType()
class FieldError {
    @Field()
    field: string
    
    @Field()
    message: string
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], {nullable: true})
    errors?: FieldError[]
    
    @Field(() => User, {nullable: true})
    user?: User
}

@Resolver()
export class UserResolver {
    // what if user already exists?
    @Mutation(() => UserResponse)
    async register(@Arg('options') options: UsernamePasswordInput, @Ctx() {em, req}: MyContext): Promise<UserResponse> {
        if (options.username.length < 3) {
            return {
                errors: [{ field: "username", message: "username must be of length at least 3"}]
            };
        }
        if (options.password.length < 5) {
            return {
                errors: [{ field: "password", message: "password must be of length at least 5"}]
            };
        }
        const hashedPassword = await hash(options.password);
        const emFork = em.fork();
        const user = emFork.create(User, {username: options.username, password: hashedPassword});
        try {
            await emFork.persistAndFlush(user);
        }
        catch (err) {
            // duplicate username error
            if (err.code === '23505') {
                return {
                    errors: [{ field: "username", message: "username already taken"}]
                };
            }
        }

        // store user id session, this will set a cookie on the user
        // and will keep them logged in
        req.session.userId = user.id;

        return {user};
    }

    @Query(() => UserResponse)
    async login(@Arg('options') options: UsernamePasswordInput, @Ctx() {em, req}: MyContext): Promise<UserResponse> {
        const emFork = em.fork();
        const user = await emFork.findOne(User, {username: options.username});
        if (!user) {
            return {
                errors: [{ field: "username", message: "invalid username" }]
            };
        }
        
        const valid = await verify(user.password, options.password);
        if (!valid) {
            return {
                errors: [{ field: "password", message: "incorrect password" }]
            };
        }

        req.session.userId = user.id;
        //req.session.save();
        console.log(req.session.id); 

        return {user};
    }

    @Query(() => User, {nullable: true})
    async me(@Ctx() {em, req}: MyContext): Promise<User | null> {

        console.log(req.session.id); 
        
        // not logged in
        if (!req.session.userId) {
            return null;
        }
        
        const emFork = em.fork();
        const user = await emFork.findOne(User, {id: req.session.userId});
        return user;
    }

}