import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from "bcrypt";
import * as dotenv from 'dotenv';
import * as jwt from 'jsonwebtoken';
import * as crypto from "crypto";
import { Admin, User, UserModel } from "./user.model";
dotenv.config();

@Injectable() 
export class UserService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<User>,
        @InjectModel('Admin') private readonly adminModel: Model<Admin>
    ) {}
    
    async addUser( 
        username: string, name: string, email: string, 
        password: string, department: string, role: string
    ) {
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
            await newUser.save();
            return { message: 'User registered' };
        } else { 
            // save admin
            const newAdmin = new this.adminModel({
                username,
                name,
                email,
                password: hashedPassword,
                department
            })
            await newAdmin.save();
            return { message: 'Admin registered' };
        }
    }

    async verifyUser(username: string, password: string, role: string) {
        // find user based on username
        const user = await this.getUser(role, username);

        // verify if the password matches the hashed password
        const passwordMatches = await bcrypt.compare(password, user.password);
        if (passwordMatches) {
            // generate access token for future auth
            return this.generateAccessToken(user.id, role);
        } else {
            throw new HttpException("Invalid password", HttpStatus.UNAUTHORIZED)
        }
    }

    async removeUser(username: string) {
        const user = await this.getUser('user', username);
        await this.userModel.deleteOne({_id: user.id});
        return { message: "User deleted" }
    }

    async updateUser(
        user: User, username?: string, name?: string, email?: string, 
        password?: string, department?: string, extension?: string
    ) {
        var updates = {}

        if (username) {
            updates['username'] = username
        }
        if (name) {
            updates['name'] = name
        }
        if (email) {
            updates['email'] = email
        }
        if (password) {
            updates['password'] = await this.hashPassword(password);
        }
        if (department) {
            updates['department'] = department
        }

        if (extension) {            
            updates['subscriptionExpiryDate'] = user
                .subscriptionExpiryDate
                .setDate(user.subscriptionExpiryDate.getDate() + parseInt(extension));  
        }
        
        await UserModel.updateOne(
            { _id: user.id }, 
            { $set: updates }
        )
        return { message: 'User updated' }
    }

    async getUser(role: string, username?: string, email?: string, userID?: string) {
        var user;
        if (role === 'admin') {
            if (username) {
                user = await this.adminModel.findOne({ username });
                console.log(user)
            } else if (email) {
                user = await this.adminModel.findOne({ email });
            } else if (userID) {
                user = await this.adminModel.findById(userID)
            }
        } else {
            if (username) {
                user = await this.userModel.findOne({ username });
            } else if (email) {
                user = await this.userModel.findOne({ email });
            } else if (userID) {
                user = await this.userModel.findById(userID)
            }
        }
        
        if (! user) {
            throw new HttpException("User not found", HttpStatus.NOT_FOUND);
        }
        return user;
    }

    async getUsers(expireIn?: string, name?: string, department?: string) {
        let query = {};
      
        if (expireIn) {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + parseInt(expireIn));
            query['subscriptionExpiryDate'] = { $lt: expiryDate };
        }
      
        if (name) {
            query['name'] = name;
        }
      
        if (department) {
            query['department'] = department;
        }
      
        const users = await UserModel.find(query).exec();
        return users;
    }

    private async hashPassword(password: string) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    }

    private generateAccessToken(id: string, role: string) {
        const meta = this.encryptID(id + '+' + role);
        const payload = { meta: meta };
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '1h'});
        return accessToken;
    }

    private encryptID(userID: string) {
        const iv = crypto.randomBytes(16); 
        const cipher = crypto.createCipheriv(
            'aes-256-cbc', process.env.ENCRYPT_SECRET, iv
        );
        let encrypted = cipher.update(userID, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + encrypted;
    }
}