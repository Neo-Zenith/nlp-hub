import { Body, Controller, Post } from "@nestjs/common";
import { UserService } from "./users.service";
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiSecurity } from "@nestjs/swagger";
import { IDRequestSchema, IDResponseSchema, httpExceptionSchema, serverMessageResponseSchema } from "src/custom/custom.schema";
import { addUserSchema, loginResponse as loginResponseSchema, updateUserSchema, updateUserSubscriptionSchema, userLoginSchema } from "./user.schema";

@ApiTags('Users')
@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) {}

    @ApiOperation({ summary: 'Adds a user.' })
    @ApiBody({ schema: addUserSchema })
    @ApiResponse({ 
        status: 201, 
        schema: IDResponseSchema,
        description: 'User registered successfully.' 
    })
    @ApiResponse({ 
        status: 409, 
        schema: httpExceptionSchema,
        description: 'Username taken, or email taken.' 
    })
    @ApiResponse({ 
        status: 400, 
        schema: httpExceptionSchema,
        description: 'Incomplete body.' 
    })
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

    @ApiOperation({ summary: 'User login.' })
    @ApiBody({ schema: userLoginSchema })
    @ApiResponse({ 
        status: 201, 
        schema: loginResponseSchema,
        description: 'Successful user login.' 
    })
    @ApiResponse({ 
        status: 404, 
        schema: httpExceptionSchema,
        description: 'The requested user could not be found.' })
    @ApiResponse({ 
        status: 401, 
        schema: httpExceptionSchema,
        description: 'Invalid password.' })
    @ApiResponse({ 
        status: 400, 
        schema: httpExceptionSchema,
        description: 'Incomplete body.' })
    @Post('login')
    async login(
        @Body('username') username: string,
        @Body('password') password: string
    ) {
        const accessToken = await this.userService.verifyUser(username, password, 'user');
        return { accessToken: accessToken };
    }

    @ApiOperation({ summary: 'Removes a user.' })
    @ApiSecurity('access-token')
    @ApiBody({ schema: IDRequestSchema })
    @ApiResponse({ 
        status: 400, 
        schema: httpExceptionSchema,
        description: 'Invalid user ID format.' 
    })
    @ApiResponse({ 
        status: 404, 
        schema: httpExceptionSchema,
        description: 'The requested user could not be found.' 
    })
    @ApiResponse({ 
        status: 201, 
        schema: serverMessageResponseSchema,
        description: 'User deleted successfully.' 
    })
    @ApiResponse({ 
        status: 403, 
        schema: httpExceptionSchema,
        description: 'User ID passed in do not match the user making the request'
    })
    @Post('remove') 
    async removeUser(
        @Body('id') userID: string,
    ) {
        const message = await this.userService.removeUser(userID);
        return message;
    }

    @ApiOperation({ summary: 'Updates information of a user.'})
    @ApiSecurity('access-token')
    @ApiBody({ schema: updateUserSchema })
    @ApiResponse({
        status: 201,
        schema: serverMessageResponseSchema,
        description: 'User information updated successfully.'
    })
    @ApiResponse({
        status: 404,
        schema: httpExceptionSchema,
        description: 'The requested user could not be found.'
    })
    @ApiResponse({
        status: 400,
        schema: httpExceptionSchema,
        description: 'Invalid user ID format.'
    })
    @ApiResponse({
        status: 409,
        schema: httpExceptionSchema,
        description: 'Username or email already exist.'
    })
    @Post('update')
    async updateUser(
        @Body('id') id: string,
        @Body('name') name?: string,
        @Body('username') username?: string,
        @Body('email') email?: string,
        @Body('password') password?: string,
        @Body('department') department?: string
    ) {
        const message = this.userService.updateUser(id, username, name, email, password, department)
        return message;
    }
}

@ApiTags('Admins')
@Controller('admins') 
export class AdminController {
    constructor(
        private readonly adminService: UserService
    ) {}

    @ApiOperation({ summary: 'Register a user with admin privillege.' })
    @ApiSecurity('access-token')
    @ApiBody({ schema: addUserSchema })
    @ApiResponse({ 
        status: 201, 
        schema: IDResponseSchema,
        description: 'Admin registered successfully.' 
    })
    @ApiResponse({ 
        status: 409, 
        schema: httpExceptionSchema,
        description: 'Username taken, or email taken.' 
    })
    @ApiResponse({ 
        status: 400, 
        schema: httpExceptionSchema,
        description: 'Incomplete body.' 
    })
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

    @ApiOperation({ summary: 'Admin login' })
    @ApiBody({ schema: userLoginSchema })
    @ApiResponse({ 
        status: 201, 
        schema: loginResponseSchema,
        description: 'Successful admin login.' 
    })
    @ApiResponse({ 
        status: 404, 
        schema: httpExceptionSchema,
        description: 'The requested admin could not be found.' 
    })
    @ApiResponse({ 
        status: 401, 
        schema: httpExceptionSchema,
        description: 'Invalid password.' 
    })
    @ApiResponse({ 
        status: 400, 
        schema: httpExceptionSchema,
        description: 'Incomplete body.' 
    })
    @Post('login')
    async login(
        @Body('username') username: string,
        @Body('password') password: string
    ) {
        const accessToken = await this.adminService.verifyUser(username, password, 'admin');
        return { accessToken: accessToken };
    }

    @ApiOperation({ summary: 'Modify user subscription.' })
    @ApiSecurity('access-token')
    @ApiBody({ schema: updateUserSubscriptionSchema })
    @ApiResponse({
        status: 404,
        schema: httpExceptionSchema,
        description: 'The requested user could not be found.'
    })
    @ApiResponse({
        status: 400,
        schema: httpExceptionSchema,
        description: 'Invalid user ID format.'
    })
    @ApiResponse({
        status: 201,
        schema: serverMessageResponseSchema,
        description: 'User subscription extended successfully.'
    })
    @Post('extend-subscription')
    async extendSubscription(
        @Body('userID') userID: string,
        @Body('extension') extension: string
    ) {
        await this.adminService.updateUser(
            userID, 
            undefined, 
            undefined, 
            undefined, 
            undefined, 
            undefined, 
            extension
        )
        return { message: 'User subscription extended successfully.' }
    }
}