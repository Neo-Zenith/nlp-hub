import { Body, Controller, Post } from "@nestjs/common";
import { UserService } from "./users.service";
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiSecurity } from "@nestjs/swagger";

@ApiTags('Users')
@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) {}

    @ApiOperation({ summary: 'Adds a user to the server' })
    @ApiBody({
        schema: {
            properties: {
                'name': { 
                    type: 'string',
                    description: 'Name of the user',
                    example: 'John Doe'
                },
                'username': {
                    type: 'string',
                    description: 'Username of the user',
                    example: 'User01'
                },
                'email': {
                    type: 'string',
                    description: 'Email of the user',
                    example: 'user@example.com'
                },
                'password': {
                    type: 'string',
                    description: 'Password of the user',
                    example: 'password123'
                },
                'department': {
                    type: 'string',
                    description: 'Department of the user',
                    example: 'SCSE'
                }
            }
        }
    })
    @ApiResponse({ status: 201, description: 'User successfully registered.' })
    @ApiResponse({ status: 409, description: 'Username taken, or email taken.' })
    @ApiResponse({ status: 400, description: 'Incomplete body.' })
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

    @ApiOperation({ summary: 'User login' })
    @ApiBody({
        schema: {
            properties: {
                'username': {
                    type: 'string',
                    description: 'Username of the user',
                    example: 'User01'
                },
                'password': {
                    type: 'string',
                    description: 'Password of the user',
                    example: 'password123'
                }
            }
        }
    })
    @ApiResponse({ status: 201, description: 'Successful user login.' })
    @ApiResponse({ status: 404, description: 'The requested user could not be found.' })
    @ApiResponse({ status: 401, description: 'Invalid password.' })
    @ApiResponse({ status: 400, description: 'Incomplete body.' })
    @Post('login')
    async login(
        @Body('username') username: string,
        @Body('password') password: string
    ) {
        const accessToken = await this.userService.verifyUser(username, password, 'user');
        return { accessToken: accessToken };
    }

    @ApiOperation({ summary: 'Removes a user from the server' })
    @ApiSecurity('access-token')
    @ApiBody({
        schema: {
            properties: {
                'id': {
                    type: 'string',
                    description: 'ID of the user to be deleted',
                    example: '54674867bc3fb5168347b088'
                }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Invalid user ID format' })
    @ApiResponse({ status: 404, description: 'The requested user could not be found' })
    @ApiResponse({ status: 201, description: 'User successfully deleted' })
    @ApiResponse({ 
        status: 403, 
        description: 'User ID passed in do not match the user making the request'
    })
    @Post('remove') 
    async removeUser(
        @Body('id') userID: string,
    ) {
        const message = await this.userService.removeUser(userID);
        return message;
    }
}

@ApiTags('Admins')
@Controller('admins') 
export class AdminController {
    constructor(
        private readonly adminService: UserService
    ) {}

    @ApiOperation({ summary: 'Register a user with admin privellege to the server' })
    @ApiSecurity('access-token')
    @ApiBody({
        schema: {
            properties: {
                'name': { 
                    type: 'string',
                    description: 'Name of the user',
                    example: 'John Doe'
                },
                'username': {
                    type: 'string',
                    description: 'Username of the user',
                    example: 'User01'
                },
                'email': {
                    type: 'string',
                    description: 'Email of the user',
                    example: 'user@example.com'
                },
                'password': {
                    type: 'string',
                    description: 'Password of the user',
                    example: 'password123'
                },
                'department': {
                    type: 'string',
                    description: 'Department of the user',
                    example: 'SCSE'
                }
            }
        }
    })
    @ApiResponse({ status: 201, description: 'Admin successfully registered.' })
    @ApiResponse({ status: 409, description: 'Username taken, or email taken.' })
    @ApiResponse({ status: 400, description: 'Incomplete body.' })
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
    @ApiBody({
        schema: {
            properties: {
                'username': {
                    type: 'string',
                    description: 'Username of the admin',
                    example: 'User01'
                },
                'password': {
                    type: 'string',
                    description: 'Password of the admin',
                    example: 'password123'
                }
            }
        }
    })
    @ApiResponse({ status: 201, description: 'Successful admin login.' })
    @ApiResponse({ status: 404, description: 'The requested admin could not be found.' })
    @ApiResponse({ status: 401, description: 'Invalid password.' })
    @ApiResponse({ status: 400, description: 'Incomplete body.' })
    @Post('login')
    async login(
        @Body('username') username: string,
        @Body('password') password: string
    ) {
        const accessToken = await this.adminService.verifyUser(username, password, 'admin');
        return { accessToken: accessToken };
    }
}