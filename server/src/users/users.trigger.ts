import { HttpException, HttpStatus } from "@nestjs/common";
import { AdminModel, AdminSchema, UserModel, UserSchema } from "./user.model";
import { QueryModel } from "src/query/query.model";

export function UserTrigger() {
    UserSchema.pre('save', async function(next) {
        const userEmail = await UserModel.findOne({
            email: this.email
        });
        
        const userUsername = await UserModel.findOne({
            username: this.username
        });

        if (! userUsername && ! userEmail) {
            return next();
        } else if (userUsername) {
            throw new HttpException("Username taken", HttpStatus.CONFLICT);
        } else if (userEmail) {
            throw new HttpException("Email taken", HttpStatus.CONFLICT);
        }
    })

    UserSchema.pre('deleteOne', async function(next) {
        await QueryModel.deleteMany({
            serviceID: this.getFilter()["_id"]
        })
        return next();
    })

    UserSchema.pre('updateOne', async function(next) {
        const username = this.getUpdate()['$set']['username'];
        const email = this.getUpdate()['$set']['email']
        if (username) {
            const user = await UserModel.findOne({
                username: username
            })

            if (user && user.id !== this['_conditions']['_id']) {
                throw new HttpException('Username already exist', HttpStatus.CONFLICT)
            }
        }

        if (email) {
            const user = await UserModel.findOne({
                email: email
            })

            if (user && user.id !== this['_conditions']['_id']) {
                throw new HttpException('Email already exist', HttpStatus.CONFLICT)
            }
        }
        return next();
    })

    AdminSchema.pre('save', async function(next) {
        const adminEmail = await AdminModel.findOne({
            email: this.email
        });
        
        const adminUsername = await AdminModel.findOne({
            username: this.username
        });

        if (! adminUsername && ! adminEmail) {
            return next();
        } else if (adminUsername) {
            throw new HttpException("Username taken", HttpStatus.CONFLICT);
        } else if (adminEmail) {
            throw new HttpException("Email taken", HttpStatus.CONFLICT);
        }
    })
}