import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import * as bcrypt from 'bcrypt'
import * as dotenv from 'dotenv'
import * as jwt from 'jsonwebtoken'
import * as crypto from 'crypto'
import { Admin, User } from './users.model'
dotenv.config()

@Injectable()
export class UserService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<User>,
        @InjectModel('Admin') private readonly adminModel: Model<Admin>,
    ) {}

    async addUser(
        username: string,
        name: string,
        email: string,
        password: string,
        department: string,
    ): Promise<void> {
        const hashedPassword = await this.hashPassword(password)
        const newUser = new this.userModel({
            username,
            name,
            email,
            password: hashedPassword,
            department,
        })
        await this.saveUserDB(newUser)
    }

    async addAdmin(
        username: string,
        name: string,
        email: string,
        password: string,
        department: string,
    ): Promise<void> {
        const hashedPassword = await this.hashPassword(password)
        const newAdmin = new this.adminModel({
            username,
            name,
            email,
            password: hashedPassword,
            department,
        })
        await this.saveUserDB(newAdmin)
    }

    async verifyUser(username: string, password: string): Promise<string> {
        const message = 'Invalid credentials. Invalid username and/or password.'
        const throwable = new HttpException(message, HttpStatus.UNAUTHORIZED)
        const user = await this.getUser(username, undefined, undefined, throwable)

        const passwordMatches = await bcrypt.compare(password, user.password)
        if (passwordMatches) {
            return this.generateAccessToken(user.id, 'user')
        } else {
            throw throwable
        }
    }

    async verifyAdmin(username: string, password: string) {
        const message = 'Invalid credentials. Invalid username and/or password.'
        const throwable = new HttpException(message, HttpStatus.UNAUTHORIZED)
        const admin = await this.getAdmin(username, undefined, undefined, throwable)

        const passwordMatches = await bcrypt.compare(password, admin.password)
        if (passwordMatches) {
            return this.generateAccessToken(admin.id, 'admin')
        } else {
            throw throwable
        }
    }

    async removeUser(username: string): Promise<void> {
        const user = await this.getUser(username)
        await this.userModel.deleteOne({ _id: user.id })
    }

    async updateUser(
        user: User,
        username?: string,
        name?: string,
        email?: string,
        password?: string,
        department?: string,
    ): Promise<void> {
        const updates = {
            ...(username && { username }),
            ...(name && { name }),
            ...(email && { email }),
            ...(password && { password: await this.hashPassword(password) }),
            ...(department && { department }),
        }

        await this.updateUserDB(user, updates)
    }

    async extendUserSubscription(user: User, extension?: string) {
        if (extension) {
            const newExpiryDate = new Date(user.subscriptionExpiryDate)
            newExpiryDate.setDate(newExpiryDate.getDate() + parseInt(extension))
            const updates = { subscriptionExpiryDate: newExpiryDate }
            const message = await this.updateUserDB(user, updates)
            return message
        }
    }

    async getUser(
        username?: string,
        email?: string,
        userID?: string,
        throwable?: HttpException,
    ): Promise<User> {
        const message = 'User not found. The requested resource could not be found.'
        throwable = throwable ? throwable : new HttpException(message, HttpStatus.NOT_FOUND)

        const user = await this.userModel.findOne({
            ...(username && { username }),
            ...(email && { email }),
            ...(userID && { _id: userID }),
        })
        if (!user) {
            throw throwable
        }
        return user
    }

    async getAdmin(
        username?: string,
        email?: string,
        userID?: string,
        throwable?: HttpException,
    ): Promise<Admin> {
        const message = 'User not found. The requested resource could not be found.'
        throwable = throwable ? throwable : new HttpException(message, HttpStatus.NOT_FOUND)

        const admin = await this.adminModel.findOne({
            ...(username && { username }),
            ...(email && { email }),
            ...(userID && { _id: userID }),
        })

        if (!admin) {
            throw throwable
        }
        return admin
    }

    async getUsers(expireIn?: string, name?: string, department?: string): Promise<User[]> {
        let query = {}

        if (expireIn) {
            const expiryDate = new Date()
            expiryDate.setDate(expiryDate.getDate() + parseInt(expireIn))
            query['subscriptionExpiryDate'] = { $lt: expiryDate }
        }

        if (name) {
            query['name'] = name
        }

        if (department) {
            query['department'] = department
        }

        const users = await this.userModel.find(query).exec()
        return users
    }

    private async hashPassword(password: string): Promise<string> {
        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(password, saltRounds)
        return hashedPassword
    }

    private generateAccessToken(id: string, role: string): string {
        const meta = this.encryptID(id + '+' + role)
        const payload = { meta: meta }
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '3h' })
        return accessToken
    }

    private encryptID(userID: string): string {
        const iv = crypto.randomBytes(16)
        const cipher = crypto.createCipheriv('aes-256-cbc', process.env.ENCRYPT_SECRET, iv)
        let encrypted = cipher.update(userID, 'utf8', 'hex')
        encrypted += cipher.final('hex')
        return iv.toString('hex') + encrypted
    }

    private async saveUserDB(user: User | Admin): Promise<void> {
        try {
            await user.save()
        } catch (err) {
            if (err.message.includes('duplicate key')) {
                if (err.message.includes('username')) {
                    const message = 'Invalid username. Username already taken.'
                    throw new HttpException(message, HttpStatus.CONFLICT)
                }
                if (err.message.includes('email')) {
                    const message = 'Invalid email address. Email address already taken.'
                    throw new HttpException(message, HttpStatus.CONFLICT)
                }
            }
        }
    }

    private async updateUserDB(user: User, updates: Record<string, any>): Promise<void> {
        try {
            await this.userModel.updateOne({ _id: user.id }, { $set: updates })
        } catch (err) {
            if (err.message.includes('duplicate key')) {
                if (err.message.includes('username')) {
                    const message = 'Invalid username. Username already taken.'
                    throw new HttpException(message, HttpStatus.CONFLICT)
                }
                if (err.message.includes('email')) {
                    const message = 'Invalid email address. Email address already taken.'
                    throw new HttpException(message, HttpStatus.CONFLICT)
                }
            }
        }
    }
}
