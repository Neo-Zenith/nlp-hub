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
        role: string,
    ): Promise<Record<string, string>> {
        const hashedPassword = await this.hashPassword(password)

        if (role === 'user') {
            const newUser = new this.userModel({
                username,
                name,
                email,
                password: hashedPassword,
                department,
            })
            const message = await this.saveUser(newUser)
            return message
        } else {
            const newAdmin = new this.adminModel({
                username,
                name,
                email,
                password: hashedPassword,
                department,
            })
            const message = await this.saveUser(newAdmin)
            return message
        }
    }

    async verifyUser(username: string, password: string, role: string): Promise<string> {
        const user = await this.userModel.findOne({ username })
        if (!user) {
            const message = 'Invalid credentials. Username and/or password not found.'
            throw new HttpException(message, HttpStatus.UNAUTHORIZED)
        }
        const passwordMatches = await bcrypt.compare(password, user.password)
        if (passwordMatches) {
            return this.generateAccessToken(user.id, role)
        } else {
            const message = 'Invalid credentials. Username and/or password not found.'
            throw new HttpException(message, HttpStatus.UNAUTHORIZED)
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
        extension?: string,
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

        if (extension) {
            const newExpiryDate = new Date(user.subscriptionExpiryDate)
            newExpiryDate.setDate(newExpiryDate.getDate() + parseInt(extension))
            updates['subscriptionExpiryDate'] = newExpiryDate
        }

        const message = await this.updateUserDB(user, updates)
        return message
    }

    async getUser(
        role: string,
        username?: string,
        email?: string,
        userID?: string,
    ): Promise<User | Admin> {
        var user: User | Admin
        if (role === 'admin') {
            if (username) {
                user = await this.adminModel.findOne({ username })
            } else if (email) {
                user = await this.adminModel.findOne({ email })
            } else if (userID) {
                user = await this.adminModel.findById(userID)
            }

            if (!user) {
                const message = 'User not found. The requested resource could not be found.'
                throw new HttpException(message, HttpStatus.NOT_FOUND)
            }
        } else {
            if (username) {
                user = await this.userModel.findOne({ username })
            } else if (email) {
                user = await this.userModel.findOne({ email })
            } else if (userID) {
                user = await this.userModel.findById(userID)
            }

            if (!user) {
                const message = 'Access denied. User is not authorized to access this resource.'
                throw new HttpException(message, HttpStatus.FORBIDDEN)
            }
        }

        return user
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

    private async saveUser(user: User | Admin): Promise<Record<string, string>> {
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
