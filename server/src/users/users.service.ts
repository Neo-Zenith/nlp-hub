import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
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
    
    async insertUser( username: string, 
                name: string, 
                email: string,
                password: string,
                department: string) {

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


    async verifyUser(username: string, password: string) {
        // find if the username exists
        const user = await this.existingUsername(username);
        if (! user) {
            throw new HttpException("User not found", HttpStatus.NOT_FOUND);
        }

        // verify if the password matches the hashed password
        const passwordMatches = await bcrypt.compare(password, user.password);
        if (passwordMatches) {
            // if login successful, generate access token to be used as auth for consecutive
            // access to restricted contents
            return this.generateAccessToken(user.username, user.id, user.role);
        } else {
            throw new HttpException("Invalid password", HttpStatus.UNAUTHORIZED)
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
}