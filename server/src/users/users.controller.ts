import { Body, Controller, Post } from "@nestjs/common";
import { UserService } from "./users.service";
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiSecurity } from "@nestjs/swagger";
import { httpException } from "src/custom/custom.schema";

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
    @ApiResponse({ 
        status: 201, 
        schema: {
            properties: {
                'id': {
                    type: 'string',
                    description: 'ID of the newly created user',
                    example: '5467443817296ad01d46a430'
                }
            }
        },
        description: 'User successfully registered.' 
    })
    @ApiResponse({ 
        status: 409, 
        schema: httpException,
        description: 'Username taken, or email taken.' 
    })
    @ApiResponse({ 
        status: 400, 
        schema: httpException,
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
    @ApiResponse({ 
        status: 201, 
        schema: {
            properties: {
                'accessToken': {
                    type: 'string',
                    description: 'Access token for subsequent authentication',
                    example: 'eyJhbGciOiJIUzI1NiIsKnR5cCI6IopXVCJ9.eyJ1c2VybmFtZSI6Ik5lb1plbml0aCIsImlkIjoiNjQ2NWIzZGM0Yjg1MTcxNmY4MThmOTY3Iiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNjg0NzM5MDkxLCJleHAiOiE2ODQ3NDI2OTF9.0gBiSS4cZzBXqe2KHhcy25sL77zsxgUqSkzLr_6rF6s'
                }
            }
        },
        description: 'Successful user login.' 
    })
    @ApiResponse({ 
        status: 404, 
        schema: httpException,
        description: 'The requested user could not be found.' })
    @ApiResponse({ 
        status: 401, 
        schema: httpException,
        description: 'Invalid password.' })
    @ApiResponse({ 
        status: 400, 
        schema: httpException,
        description: 'Incomplete body.' })
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
    @ApiResponse({ 
        status: 400, 
        schema: httpException,
        description: 'Invalid user ID format' 
    })
    @ApiResponse({ 
        status: 404, 
        schema: httpException,
        description: 'The requested user could not be found' 
    })
    @ApiResponse({ 
        status: 201, 
        schema: {
            properties: {
                'message': {
                    type: 'string',
                    description: 'Return message from server',
                    example: 'User deleted'
                }
            }
        },
        description: 'User successfully deleted' 
    })
    @ApiResponse({ 
        status: 403, 
        schema: httpException,
        description: 'User ID passed in do not match the user making the request'
    })
    @Post('remove') 
    async removeUser(
        @Body('id') userID: string,
    ) {
        const message = await this.userService.removeUser(userID);
        return message;
    }

    @ApiOperation({ summary: 'Updates information of a user'})
    @ApiSecurity('access-token')
    @ApiBody({
        schema: {
            properties: {
                'id': {
                    type: 'string',
                    description: 'ID of the user to be updated',
                    example: '5467443817296ad01d46a430'
                },
                'username': {
                    type: 'string',
                    description: 'Username of the user to be updated',
                    example: 'User02'
                },
                'name': {
                    type: 'string',
                    description: 'Name of the user to be updated',
                    example: 'John Smith'
                },
                'email': {
                    type: 'string',
                    description: 'Email of the user to be updated',
                    example: 'test@example.com'
                },
                'password': {
                    type: 'string',
                    description: 'Password of the user to be updated',
                    example: 'test@example.com'
                },
                'department': {
                    type: 'string',
                    description: 'Department of the user to be updated',
                    example: 'MAE'
                }
            }
        }
    })
    @ApiResponse({
        status: 201,
        schema: {
            properties: {
                'message': {
                    type: 'string',
                    description: 'Return message from server',
                    example: 'User updated'
                }
            }
        },
        description: 'User information updated successfully.'
    })
    @ApiResponse({
        status: 404,
        schema: httpException,
        description: 'The requested user could not be found.'
    })
    @ApiResponse({
        status: 400,
        schema: httpException,
        description: 'Invalid user ID format'
    })
    @ApiResponse({
        status: 409,
        schema: httpException,
        description: 'Username or email already exist'
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

    @ApiOperation({ summary: 'Register a user with admin privellege to the server' })
    @ApiSecurity('access-token')
    @ApiBody({
        schema: {
            properties: {
                'name': { 
                    type: 'string',
                    description: 'Name of the admin',
                    example: 'John Doe'
                },
                'username': {
                    type: 'string',
                    description: 'Username of the admin',
                    example: 'Admin01'
                },
                'email': {
                    type: 'string',
                    description: 'Email of the admin',
                    example: 'admin@example.com'
                },
                'password': {
                    type: 'string',
                    description: 'Password of the admin',
                    example: 'password123'
                },
                'department': {
                    type: 'string',
                    description: 'Department of the admin',
                    example: 'SCSE'
                }
            }
        }
    })
    @ApiResponse({ 
        status: 201, 
        schema: {
            properties: {
                'id': {
                    type: 'string',
                    description: 'ID of the newly created admin',
                    example: '5467443817296ad01d46a430'
                }
            }
        },
        description: 'Admin successfully registered.' 
    })
    @ApiResponse({ 
        status: 409, 
        schema: httpException,
        description: 'Username taken, or email taken.' 
    })
    @ApiResponse({ 
        status: 400, 
        schema: httpException,
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
    @ApiResponse({ 
        status: 201, 
        schema: {
            properties: {
                'accessToken': {
                    type: 'string',
                    description: 'Access token for subsequent authentication',
                    example: 'eyJhbGciOiJIUzI1NiIsKnR5cCI6IopXVCJ9.eyJ1c2VybmFtZSI6Ik5lb1plbml0aCIsImlkIjoiNjQ2NWIzZGM0Yjg1MTcxNmY4MThmOTY3Iiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNjg0NzM5MDkxLCJleHAiOiE2ODQ3NDI2OTF9.0gBiSS4cZzBXqe2KHhcy25sL77zsxgUqSkzLr_6rF6s'
                }
            }
        },
        description: 'Successful admin login.' 
    })
    @ApiResponse({ 
        status: 404, 
        schema: httpException,
        description: 'The requested admin could not be found.' 
    })
    @ApiResponse({ 
        status: 401, 
        schema: httpException,
        description: 'Invalid password.' 
    })
    @ApiResponse({ 
        status: 400, 
        schema: httpException,
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
}