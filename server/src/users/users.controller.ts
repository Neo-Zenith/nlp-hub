import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { UserService } from "./users.service";
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiSecurity, ApiQuery, ApiParam } from "@nestjs/swagger";
import { IDRequestSchema, IDResponseSchema, httpExceptionSchema, serverMessageResponseSchema } from "src/custom/custom.schema";
import { addUserSchema, loginResponse as loginResponseSchema, retrieveUserSchema, updateUserSchema, updateUserSubscriptionSchema, userLoginSchema, userResponseSchema } from "./user.schema";

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

    @ApiOperation({ summary: 'Retrieves a user.' })
    @ApiSecurity('access-token')
    @ApiParam({
        name: 'id',
        description: 'ID must be a valid 12-byte string.'
    })
    @ApiResponse({
        status: 200,
        schema: userResponseSchema,
        description: 'User retrieved successfully.'
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
    @Get('')
    async getUser(
        @Param('id') userID: string
    ) {
        const user = await this.userService.getUser(userID);
        const obscuredUser = {
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            department: user.department
        }
        return obscuredUser;
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
        @Body('extension') extension: number
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

    @ApiOperation({ summary: 'Retrieves all users.' })
    @ApiSecurity('access-token')
    @ApiQuery({ 
        name: 'expireIn', 
        required: false,
        description: 'Returns all users with subscription expiring before current date + expireIn. Must be a positive integer.'
    })
    @ApiQuery({
        name: 'name',
        required: false,
        description: 'Name of the user. Case-sensitive and must match full string.'
    })
    @ApiQuery({
        name: 'department',
        required: false,
        description: 'Department of the user. Case-sensitive and must match full string.'
    })
    @ApiResponse({
        status: 200,
        description: 'Users retrieved successfully.',
        schema: {
            properties: {
                'users': {
                    type: 'array', 
                    description: 'Users matching the filter (if any).',
                    items: userResponseSchema
                }
            }
        }
    })
    @Get('get-users')
    async getUsers(
        @Query('expireIn') expireIn?: number,
        @Query('name') name?: string,
        @Query('department') department?: string,
    ) {
        const users = await this.adminService.getAllUsers(expireIn, name, department);
        
        var returnPayload = []
        for (const user of users) {
            const obscuredUser = {
                id: user.id,
                email: user.email,
                name: user.name,
                department: user.department,
                subscriptionExpiryDate: user.subscriptionExpiryDate
            }
            returnPayload.push(obscuredUser)
        }

        return { users: returnPayload }
    }
}