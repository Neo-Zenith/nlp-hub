import { Body, Controller, Post } from "@nestjs/common";
import { UserService } from "./users.service";

@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) {}

    // register a user
    @Post('register')
    async register(
        @Body('name') name: string,
        @Body('username') username: string,
        @Body('email') email: string,
        @Body('password') password: string,
        @Body('department') department: string
    ) {
        const userID = await this.userService.insertUser(
            username, 
            name, 
            email, 
            password, 
            department);
        return {id: userID};
    }

    // user login
    @Post('login')
    async login(
        @Body('username') username: string,
        @Body('password') password: string
    ) {
        const accessToken = await this.userService.verifyUser(username, password);
        return {accessToken: accessToken};
    }
}