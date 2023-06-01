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
    ): Promise<Record<string, string>> {
        const hashedPassword = await this.hashPassword(password)
        const newAdmin = new this.adminModel({
            username,
            name,
            email,
            password: hashedPassword,
            department,
        })
        const message = await this.saveUserDB(newAdmin)
        return message
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

    async removeUser(username: string): Promise<Record<string, string>> {
        const user = await this.getUser('user', username)
        await this.userModel.deleteOne({ _id: user.id })
        return { message: 'User deleted.' }
    }

    async updateUser(
        user: User,
        username?: string,
        name?: string,
        email?: string,
        password?: string,
        department?: string,
    ): Promise<Record<string, string>> {
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
            updates['password'] = await this.hashPassword(password)
        }
        if (department) {
            updates['department'] = department
        }

        const message = await this.updateUserDB(user, updates)
        return message
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
            ...(userID && { userID }),
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
            ...(userID && { userID }),
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

    private async saveUserDB(user: User | Admin): Promise<Record<string, string>> {
        try {
            await user.save()
            return { message: 'User registered.' }
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

    private async updateUserDB(
        user: User,
        updates: Record<string, any>,
    ): Promise<Record<string, string>> {
        try {
            await this.userModel.updateOne({ _id: user.id }, { $set: updates })
            return { message: 'User updated.' }
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
