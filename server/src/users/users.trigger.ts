import { UserSchema } from "./users.model";
import { QueryModel } from "../queries/queries.model";

export function UserTrigger() {
    UserSchema.pre('deleteOne', async function(next) {
        await QueryModel.deleteMany({
            serviceID: this.getFilter()["_id"]
        })
        return next();
    })
}