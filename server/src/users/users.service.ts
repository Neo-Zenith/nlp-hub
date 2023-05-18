import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from "bcrypt";
import * as dotenv from 'dotenv';
import * as jwt from 'jsonwebtoken';
import { Admin, User } from "./user.model";
dotenv.config();

@Injectable() 
export class UserService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<User>,
        @InjectModel('Admin') private readonly adminModel: Model<Admin>
    ) {}
    
    async insertUser( username: string, 
                name: string, 
                email: string,
                password: string,
                department: string,
                role: string) {

        // hash the password before saving to db
        const hashedPassword = await this.hashPassword(password);

        if (role === 'user') {
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
        } else { // save admin
            const newAdmin = new this.adminModel({
                username,
                name,
                email,
                password: hashedPassword,
                department
            })
            const admin = await newAdmin.save();
            return admin.id;
        }
    }

    async verifyUser(username: string, password: string, role: string) {
        // find if the username exists
        const user = await this.existingUsername(username, role);
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

    private async hashPassword(password: string) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    }

    private generateAccessToken(username: string, id: string, role: string) {
        const payload = {username: username, id: id, role: role};
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '1h'});
        return accessToken;
    }

    private async existingUsername(username: string, role: string) {
        var user;
        if (role === 'user') {
            user = await this.userModel.findOne({username: username})
        } else {
            user = await this.adminModel.findOne({username: username})
        }
        
        if (user) {
            return user;
        }
        return false;
    }
}