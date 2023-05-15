import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from "bcrypt";
import * as dotenv from 'dotenv';
import * as jwt from 'jsonwebtoken';
import { User } from "./user.model";
dotenv.config();

@Injectable() 
export class UserService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<User>
    ) {}
    
    /**
     * Subroutine called by register route to register a user
     * @param username Username of the user
     * @param name Name of the user
     * @param email Email of the user
     * @param password Unhashed password of the user
     * @param department Department of the user
     * @returns Code 1 if email is taken; Code 2 if username is taken; ID of the user if successul registration
     */
    async insertUser( username: string, 
                name: string, 
                email: string,
                password: string,
                department: string) {
        
        // checks if user is already in the db (username/email)
        const userExist = await this.existingUser(email, username);

        if (userExist[0]) {
            return 1;
        } else if (userExist[1]) {
            return 2;
        }

        // hash the password before saving to db
        const hashedPassword = await this.hashPassword(password);

        // save user 
        const newUser = new this.userModel({
            username,
            name,
            email,
            password: hashedPassword,
            department
        })
        const user = await newUser.save();
        return user.id;
    }

    /**
     * Subroutine called by login route to login a user
     * @param username Username of the user
     * @param password Unhashed password of the user
     * @returns Boolean {@linkcode false} if invalid login credentials; Access token otherwise
     */
    async verifyUser(username: string, password: string) {
        // find if the username exists
        const user = await this.existingUsername(username);
        if (!user) {
            return false;
        }

        // verify if the password matches the hashed password
        const passwordMatches = await bcrypt.compare(password, user.password);
        if (passwordMatches) {
            // if login successful, generate access token to be used as auth for consecutive
            // access to restricted contents
            return this.generateAccessToken(user.username, user.id, user.role);
        } else {
            return false;
        }
    }

    /**
     * Subroutine to hash the password before saving to db using bcrypt
     * @param password Unhashed password
     * @returns Hashed password
     */
    private async hashPassword(password: string) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    }

    /**
     * Using a random 128-letter string as key to generate access token
     * @param username Username of the user
     * @param id ID of the user
     * @param role Role of the user ('admin'/'user')
     * @returns Access token
     */
    private generateAccessToken(username: string, id: string, role: string) {
        const payload = {username: username, id: id, role: role};
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '1h'});
        return accessToken;
    }

    /**
     * Subroutine to check if username exists in db
     * @param username Username of the user
     * @returns Boolean {@linkcode false} if not exists; JSON {@link User} otherwise
     */
    private async existingUsername(username: string) {
        const user = await this.userModel.findOne({username: username})
        if (user) {
            return user;
        }
        return false;
    }

    /**
     * Subroutine to check if email exists in db
     * @param email Email of the user
     * @returns Boolean {@linkcode false} if not exists; JSON {@link User} otherwise
     */
    private async existingEmail(email: string) {
        const user = await this.userModel.findOne({email: email});
        if (user) {
            return user;
        }
        return false;
    }

    /**
     * Subroutine to check for existing user
     * @param email Email of the user
     * @param username Username of the user
     * @returns Array[Boolean, Boolean] => Array[emailTaken, usernameTaken]
     */
    private async existingUser(email: string, username: string) {
        var payload = [false, false]

        // checks if email has been taken
        const existingEmail = await this.existingEmail(email);
        if (existingEmail) {
            payload[0] = true;
        }

        // checks if username has been taken
        const existingUsername = await this.existingUsername(username);
        if (existingUsername) {
            payload[1] = true;
        }

        return payload;
    }
}