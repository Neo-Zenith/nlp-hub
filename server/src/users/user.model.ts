import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


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

// Define the user schema
@Schema()
export class User extends DefaultUser {
    @Prop()
    subscriptionExpiryDate: Date;
}

// Define the Admin schema by extending the User schema
@Schema()
export class Admin extends DefaultUser {
    @Prop({ default: 'admin' })
    role: string;
}

// Create the User and Admin models using the schema factory
export const UserSchema = SchemaFactory.createForClass(User);
export const AdminSchema = SchemaFactory.createForClass(Admin);

