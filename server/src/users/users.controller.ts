import { Body, Controller, Post } from "@nestjs/common";
import { UserService } from "./users.service";

@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) {}

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
            department,
            'user');

        return { id: userID };
    }


    @Post('login')
    async login(
        @Body('username') username: string,
        @Body('password') password: string
    ) {
        const accessToken = await this.userService.verifyUser(username, password, 'user');
        return { accessToken: accessToken };
    }
}

@Controller('admins') 
export class AdminController {
    constructor(
        private readonly adminService: UserService
    ) {}

    @Post('register') 
    async register(
        @Body('name') name: string,
        @Body('username') username: string,
        @Body('email') email: string,
        @Body('password') password: string,
        @Body('department') department: string
    ) {
        const adminID = await this.adminService.insertUser(
            username, name, email, password, department, 'admin');
        
        return { id: adminID }
    }

    @Post('login')
    async login(
        @Body('username') username: string,
        @Body('password') password: string
    ) {
        const accessToken = await this.adminService.verifyUser(username, password, 'admin');
        return { accessToken: accessToken };
    }
}