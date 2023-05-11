import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from "bcrypt";
import * as dotenv from 'dotenv';
import * as jwt from 'jsonwebtoken';
import { User } from "./user.model";

@Injectable() 
export class UserService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<User>
    ) {}
    
    // subroutine called by register route to register a user
    async insertUser( username: string, 
                name: string, 
                email: string,
                password: string,
                department: string) {
        
        // checks if email has been taken
        const existingEmail = await this.existingEmail(email);
        if (existingEmail) {
            throw new HttpException({
                status: HttpStatus.CONFLICT,
                error: 'Email is already taken!',
            }, HttpStatus.CONFLICT);
        }

        // checks if username has been taken
        const existingUsername = await this.existingUsername(username);
        if (existingUsername) {
            throw new HttpException({
                status: HttpStatus.CONFLICT,
                error: 'Username is already taken!',
            }, HttpStatus.CONFLICT);
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
        return user.id as string;
    }

    // subroutine called by login route to login a user
    async verifyUser(username: string, password: string) {
        // find if the username exists
        const user = await this.existingUsername(username);
        if (!user) {
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        }

        // verify if the password matches the hashed password
        const passwordMatches = await bcrypt.compare(password, user.password);
        if (passwordMatches) {
            // if login successful, generate access token to be used as auth for consecutive
            // access to restricted contents
            return this.generateAccessToken(user.username, user.id);
        } else {
            throw new HttpException('Unauthroized', HttpStatus.UNAUTHORIZED);
        }
    }

    // subroutine to hash the password before saving to db using bcrypt
    private async hashPassword(password: string) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword as string;
    }

    // using a random 128-letter string as key to generate access token (expires in 1h)
    private generateAccessToken(username: string, id: string) {
        dotenv.config();
        const payload = {username: username, id: id};
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '1h'});
        return accessToken as string;
    }

    // subroutine to check if username exists in db
    private async existingUsername(username: string) {
        const user = await this.userModel.findOne({username: username})
        if (user) {
            return user;
        }
        return false;
    }

    // subroutine to check if email exists in db
    private async existingEmail(email: string) {
        const user = await this.userModel.findOne({email: email});
        if (user) {
            return user;
        }
        return false;
    }
}