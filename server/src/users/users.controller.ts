import { Body, Controller, Get, Param, Post, Put, Delete, Query, Req, UseGuards, UseInterceptors } from "@nestjs/common";
import { UserService } from "./users.service";
import { 
    ApiTags, 
    ApiOperation,
    ApiBody, 
    ApiResponse, 
    ApiSecurity, 
    ApiQuery, 
    ApiParam 
} from "@nestjs/swagger";
import { CustomRequest } from "src/custom/request/request.model";
import { ExtendSubscriptionSchema, InsertUserSchema, LoginUserSchema, UpdateUserSchema } from "./user.schema";
import { AdminAuthGuard, UserAuthGuard } from "src/custom/custom.middleware";
import { ModifyUserInterceptor } from "./user.middleware";

@ApiTags('Users')
@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) {}

    @ApiOperation({ summary: 'Adds a user.' })
    @ApiBody({ type: InsertUserSchema })
    @Post('register')
    async registerUser(
        @Body('name') name: string,
        @Body('username') username: string,
        @Body('email') email: string,
        @Body('password') password: string,
        @Body('department') department: string
    ) {
        const message = await this.userService.addUser(
            username, name, email, password, department, 'user'
        );
        return message;
    }

    @ApiOperation({ summary: 'User login.' })
    @ApiBody({ type: LoginUserSchema })
    @Post('login')
    async login(
        @Body('username') username: string,
        @Body('password') password: string
    ) {
        const accessToken = await this.userService
            .verifyUser(username, password, 'user');
        return { accessToken: accessToken };
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
    @Get('')
    @UseGuards(new AdminAuthGuard(['GET']))
    async getUsers(
        @Query('expireIn') expireIn?: string,
        @Query('name') name?: string,
        @Query('department') department?: string,
    ) {
        const users = await this.userService.getUsers(expireIn, name, department);
        
        var returnPayload = []
        for (const user of users) {
            const obscuredUser = {
                email: user.email,
                name: user.name,
                department: user.department,
                subscriptionExpiryDate: user.subscriptionExpiryDate
            }
            returnPayload.push(obscuredUser)
        }

        return { users: returnPayload }
    }

    @ApiOperation({ summary: 'Retrieves a user.' })
    @ApiSecurity('access-token')
    @ApiParam({
        name: 'username',
        description: 'Username of the user.'
    })
    @Get(':username')
    @UseGuards(new UserAuthGuard(['GET']))
    async getUser(
        @Param('username') username: string
    ) {
        const user = await this.userService.getUser('user', username);
        const obscuredUser = {
            username: user.username,
            name: user.name,
            email: user.email,
            department: user.department,
            subscriptionExpiryDate: user.subscriptionExpiryDate
        }
        return obscuredUser;
    }

    @ApiOperation({ summary: 'Updates information of a user.'})
    @ApiSecurity('access-token')
    @ApiBody({ type: UpdateUserSchema })
    @Put(':username')
    @UseGuards(new UserAuthGuard(['PUT']))
    @UseInterceptors(ModifyUserInterceptor)
    async updateUser(
        @Param('username') oldUsername: string,
        @Body('name') name?: string,
        @Body('username') newUsername?: string,
        @Body('email') email?: string,
        @Body('password') password?: string,
        @Body('department') department?: string
    ) {
        const user = await this.userService.getUser('user', oldUsername);
        const message = this.userService.updateUser(
            user, newUsername, name, email, password, department
        );
        return message;
    }


    @ApiOperation({ summary: 'Removes a user.' })
    @ApiSecurity('access-token')
    @Delete(':username') 
    @UseGuards(new UserAuthGuard(['DELETE']))
    @UseInterceptors(ModifyUserInterceptor)
    async removeUser(
        @Param('username') username: string
    ) {
        const message = await this.userService.removeUser(username);
        return message;
    }
    

    @ApiOperation({ summary: 'Modify user subscription.' })
    @ApiSecurity('access-token')
    @ApiBody({ type: ExtendSubscriptionSchema })
    @Put(':username/extend-subscription')
    @UseGuards(new AdminAuthGuard(['PUT']))
    async extendSubscription(
        @Param('username') username: string,
        @Body('extension') extension: string
    ) {
        const user = await this.userService.getUser('user', username);
        await this.userService.updateUser(
            user, undefined, undefined, undefined, undefined, undefined, extension
        );
        return { message: 'User subscription extended successfully.' }
    }
}

@ApiTags('Admins')
@Controller('admins') 
export class AdminController {
    constructor(
        private readonly adminService: UserService
    ) {}

    @ApiOperation({ summary: 'Adds a user with admin privillege.' })
    @ApiSecurity('access-token')
    @ApiBody({ type: InsertUserSchema })
    @Post('register')
    @UseGuards(new AdminAuthGuard(['POST']))
    async registerAdmin(
        @Body('name') name: string,
        @Body('username') username: string,
        @Body('email') email: string,
        @Body('password') password: string,
        @Body('department') department: string
    ) {
        const message = await this.adminService.addUser(
            username, name, email, password, department, 'admin'
        );
        return message;
    }

    @ApiOperation({ summary: 'Admin login.' })
    @ApiBody({ type: LoginUserSchema })
    @Post('login')
    async login(
        @Body('username') username: string,
        @Body('password') password: string
    ) {
        const accessToken = await this.adminService
            .verifyUser(username, password, 'admin');
        return { accessToken: accessToken };
    }
}