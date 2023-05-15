import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getModelForClass } from '@typegoose/typegoose';
import { Document } from 'mongoose';

/**
 * DefaultUser(id, username, name, email, department, password)
 * PK: id
 * NOT NULL: username, name, email, password, department
 */
class DefaultUser extends Document {
    @Prop()
    username: string;

    @Prop()
    name: string;

    @Prop()
    email: string;

    @Prop()
    password: string;

    @Prop() 
    department: string;
}

/**
 * User(id, username, name, email, password, department, role, subscriptionExpiryDate)
 * PK: id
 * NOT NULL: username, name, email, password, department, role, subscriptionExpiryDate
 * DEFAULT: {role: 'user', subscriptionExpiryDate: 30 days from current date}
 */
@Schema()
export class User extends DefaultUser {
    @Prop({ default: 'user'})
    role: string;

    @Prop({
        default: () => {
            const now = new Date();
            now.setDate(now.getDate() + 30);
            return now;
        },
    })
    subscriptionExpiryDate: Date;
}

/**
 * Admin(id, username, name, email, password, department, role)
 * PK: id
 * NOT NULL: username, name, email, password, department, role
 * DEFAULT: {role: 'user'}
 */
@Schema()
export class Admin extends DefaultUser {
    @Prop({ default: 'admin' })
    role: string;
}


export const UserSchema = SchemaFactory.createForClass(User);
export const UserModel = getModelForClass(User);
export const AdminSchema = SchemaFactory.createForClass(Admin);
export const AdminModel = getModelForClass(Admin);

