import { HttpException, HttpStatus } from "@nestjs/common";
import { AdminModel, AdminSchema, UserModel, UserSchema } from "./user.model";

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