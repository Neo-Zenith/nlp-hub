import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose'

/**
 * DefaultUser(id, username, name, email, department, password)
 * PK: id
 * NOT NULL: username, name, email, password, department
 * UNIQUE: username, email
 */
class DefaultUser extends Document {
    @Prop({ required: true, unique: true, type: String })
    username: string

    @Prop({ required: true, type: String })
    name: string

    @Prop({ required: true, unique: true, type: String })
    email: string

    @Prop({ required: true, type: String })
    password: string

    @Prop({ required: true, type: String })
    department: string
}

/**
 * User(id, username, name, email, password, department, role, subscriptionExpiryDate)
 * PK: id
 * NOT NULL: username, name, email, password, department, role, subscriptionExpiryDate
 * UNIQUE: username, email
 */
@Schema()
export class User extends DefaultUser {
    @Prop({ default: 'user', required: true, type: String })
    role: string

    @Prop({
        default: () => {
            const now = new Date()
            now.setDate(now.getDate() + 30)
            return now
        },
    })
    subscriptionExpiryDate: Date
}

/**
 * Admin(id, username, name, email, password, department, role)
 * PK: id
 * NOT NULL: username, name, email, password, department, role
 * UNIQUE: email, username
 */
@Schema()
export class Admin extends DefaultUser {
    @Prop({ default: 'admin', required: true, type: String })
    role: string
}

export const UserSchema = SchemaFactory.createForClass(User)
export const AdminSchema = SchemaFactory.createForClass(Admin)

export const UserModel = mongoose.model('User', UserSchema)
export const AdminModel = mongoose.model('Admin', AdminSchema)
