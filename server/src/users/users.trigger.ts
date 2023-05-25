import { UserSchema } from "./user.model";
import { QueryModel } from "../query/query.model";

export function UserTrigger() {
    UserSchema.pre('deleteOne', async function(next) {
        await QueryModel.deleteMany({
            serviceID: this.getFilter()["_id"]
        })
        return next();
    })
}