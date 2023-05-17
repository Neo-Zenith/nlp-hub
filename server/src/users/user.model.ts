import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getModelForClass } from '@typegoose/typegoose';
import mongoose, { Document } from 'mongoose';

/**
 * DefaultUser(id, username, name, email, department, password)
 * PK: id
 * NOT NULL: username, name, email, password, department
 */
class DefaultUser extends Document {
    @Prop( {required: true} )
    username: string;

    @Prop( {required: true} )
    name: string;

    @Prop( {required: true} )
    email: string;

    @Prop( {required: true} )
    password: string;

    @Prop( {required: true} ) 
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
    @Prop( {default: 'user', required: true} )
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
    @Prop({ default: 'admin' , required: true})
    role: string;
}


export const UserSchema = SchemaFactory.createForClass(User);
export const UserModel = mongoose.model('User', UserSchema);
export const AdminSchema = SchemaFactory.createForClass(Admin);
export const AdminModel = mongoose.model('Admin', AdminSchema);

