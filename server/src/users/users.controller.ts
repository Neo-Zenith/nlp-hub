import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Put,
    Delete,
    Query,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'

import { ApiTags, ApiOperation, ApiBody, ApiSecurity, ApiQuery, ApiParam } from '@nestjs/swagger'

import { UserService } from './users.service'
import {
    ExtendSubscriptionSchema,
    InsertUserSchema,
    LoginUserSchema,
    UpdateUserSchema,
} from './users.schema'

import { AdminAuthGuard, UserAuthGuard } from '../common/common.middleware'
import { ModifyUserInterceptor } from './users.interceptor'
import { User } from './users.model'

@ApiTags('Users')
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @ApiOperation({
        summary: 'Registers a user.',
        description:
            'User provides the necessary details in order to be registered. Email address and username are unique to a user.',
    })
    @ApiBody({ type: InsertUserSchema })
    @Post('register')
    async registerUser(
        @Body('name') name: string,
        @Body('username') username: string,
        @Body('email') email: string,
        @Body('password') password: string,
        @Body('department') department: string,
    ) {
        const message = await this.userService.addUser(
            username,
            name,
            email,
            password,
            department,
            'user',
        )
        return message
    }

    @ApiOperation({
        summary: 'User login.',
        description:
            'User provides the correct username and password used during registration to login. Once login, user will be given an access token for subsequent authentication until the token expires.',
    })
    @ApiBody({ type: LoginUserSchema })
    @Post('login')
    async login(@Body('username') username: string, @Body('password') password: string) {
        const accessToken = await this.userService.verifyUser(username, password, 'user')
        return { accessToken: accessToken }
    }

    @ApiOperation({
        summary: 'Retrieves users, subjected to the provided filters (if any).',
        description: 'Only admins are able to access this resource.',
    })
    @ApiSecurity('access-token')
    @ApiQuery({
        name: 'expireIn',
        required: false,
        description:
            'Returns all users with subscription expiring no later than current date + expireIn. Must be a positive integer.',
    })
    @ApiQuery({
        name: 'name',
        required: false,
        description:
            'Returns all users matching the name provided. Name is case-sensitive and only full-string match results are returned.',
    })
    @ApiQuery({
        name: 'department',
        required: false,
        description:
            'Returns all users matching the department provided. Department is case-sensitive and only full-string match results are returned.',
    })
    @Get('')
    @UseGuards(new AdminAuthGuard(['GET']))
    async getUsers(
        @Query('expireIn') expireIn?: string,
        @Query('name') name?: string,
        @Query('department') department?: string,
    ) {
        const users = await this.userService.getUsers(expireIn, name, department)
        var returnPayload = []
        for (const user of users) {
            const obscuredUser = {
                username: user.username,
                email: user.email,
                name: user.name,
                department: user.department,
                subscriptionExpiryDate: user.subscriptionExpiryDate,
            }
            returnPayload.push(obscuredUser)
        }

        return { users: returnPayload }
    }

    @ApiOperation({
        summary: 'Retrieves a user by username.',
        description:
            'User provides their username. User will only be able access the details of their own account, whereas admins are able to view all user details without this restriction.',
    })
    @ApiSecurity('access-token')
    @ApiParam({
        name: 'username',
        description: 'Username of the user. Username is case-sensitive.',
    })
    @Get(':username')
    @UseGuards(new UserAuthGuard(['GET']))
    async getUser(@Param('username') username: string) {
        const user = (await this.userService.getUser('user', username)) as User
        const obscuredUser = {
            username: user.username,
            name: user.name,
            email: user.email,
            department: user.department,
            subscriptionExpiryDate: user.subscriptionExpiryDate,
        }
        return obscuredUser
    }

    @ApiOperation({
        summary: 'Updates a user by username.',
        description:
            'User provides their username. User will only be able update the details of their own account, whereas admins are able to update all user details without this restriction.',
    })
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
        @Body('department') department?: string,
    ) {
        const user = (await this.userService.getUser('user', oldUsername)) as User
        const message = this.userService.updateUser(
            user,
            newUsername,
            name,
            email,
            password,
            department,
        )
        return message
    }

    @ApiOperation({
        summary: 'Removes a user by username.',
        description:
            'User provides their username. User will only be able remove their own account, whereas admins are able to remove all users without this restriction.',
    })
    @ApiSecurity('access-token')
    @Delete(':username')
    @UseGuards(new UserAuthGuard(['DELETE']))
    @UseInterceptors(ModifyUserInterceptor)
    async removeUser(@Param('username') username: string) {
        const message = await this.userService.removeUser(username)
        return message
    }

    @ApiOperation({
        summary: 'Modify user subscription period.',
        description:
            'Admins provide the username of the user whose subscription is to be modified. Extension will be done by incrementing the current subscription expiry date with the number of days passed in by the admins.',
    })
    @ApiSecurity('access-token')
    @ApiBody({ type: ExtendSubscriptionSchema })
    @Put(':username/extend-subscription')
    @UseGuards(new AdminAuthGuard(['PUT']))
    async extendSubscription(
        @Param('username') username: string,
        @Body('extension') extension: string,
    ) {
        const user = (await this.userService.getUser('user', username)) as User
        await this.userService.updateUser(
            user,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            extension,
        )
        return { message: 'User subscription extended successfully.' }
    }
}

@ApiTags('Admins')
@Controller('admins')
export class AdminController {
    constructor(private readonly adminService: UserService) {}

    @ApiOperation({
        summary: 'Adds a user with admin privillege.',
        description:
            'Admins will need to login to the genesis account in order to register for other admin accounts.',
    })
    @ApiSecurity('access-token')
    @ApiBody({ type: InsertUserSchema })
    @Post('register')
    @UseGuards(new AdminAuthGuard(['POST']))
    async registerAdmin(
        @Body('name') name: string,
        @Body('username') username: string,
        @Body('email') email: string,
        @Body('password') password: string,
        @Body('department') department: string,
    ) {
        const message = await this.adminService.addUser(
            username,
            name,
            email,
            password,
            department,
            'admin',
        )
        return message
    }

    @ApiOperation({
        summary: 'Admin login.',
        description:
            'Admin provides the username and password used during registration to authenticate with the server. Once authenticated, admin will receive an access token for future authentication until the token expires.',
    })
    @ApiBody({ type: LoginUserSchema })
    @Post('login')
    async login(@Body('username') username: string, @Body('password') password: string) {
        const accessToken = await this.adminService.verifyUser(username, password, 'admin')
        return { accessToken: accessToken }
    }
}
