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

import {
    ApiTags,
    ApiOperation,
    ApiBody,
    ApiSecurity,
    ApiQuery,
    ApiParam,
    ApiOkResponse,
    ApiCreatedResponse,
    ApiConflictResponse,
    ApiBadRequestResponse,
    ApiUnauthorizedResponse,
    ApiForbiddenResponse,
} from '@nestjs/swagger'

import { User } from './users.model'
import {
    ExtendSubscriptionSchema,
    CreateUserSchema,
    LoginUserSchema,
    UpdateUserSchema,
    LoginUserResponseSchema,
    RetrieveUsersSchema,
    RetrieveUserSchema,
    RetrieveUsersResponseSchema,
    RetreiveUserResponse,
} from './users.schema'
import { UserService } from './users.service'
import {
    UpdateUserInterceptor,
    RetrieveUserInterceptor,
    CreateUserInterceptor,
} from './users.interceptor'

import { AdminAuthGuard, UserAuthGuard } from '../common/common.middleware'

import {
    BadRequestSchema,
    ConflictSchema,
    ForbiddenSchema,
    ServerMessageSchema,
    UnauthorizedSchema,
} from '../common/common.schema'

@ApiTags('Users')
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @ApiOperation({ summary: 'Registers a user.' })
    @ApiBody({ type: CreateUserSchema })
    @ApiCreatedResponse({ type: ServerMessageSchema })
    @ApiConflictResponse({ type: ConflictSchema })
    @ApiBadRequestResponse({ type: BadRequestSchema })
    @Post('register')
    @UseInterceptors(CreateUserInterceptor)
    async createUser(
        @Body('name') name: string,
        @Body('username') username: string,
        @Body('email') email: string,
        @Body('password') password: string,
        @Body('department') department: string,
    ) {
        await this.userService.addUser(username, name, email, password, department)
        const response = { message: 'User created.' }
        return response
    }

    @ApiOperation({ summary: 'Authenticate a user.' })
    @ApiBody({ type: LoginUserSchema })
    @ApiCreatedResponse({ type: LoginUserResponseSchema })
    @ApiBadRequestResponse({ type: BadRequestSchema })
    @Post('login')
    async loginUser(@Body('username') username: string, @Body('password') password: string) {
        const accessToken = await this.userService.verifyUser(username, password)
        return { accessToken: accessToken }
    }

    @ApiOperation({ summary: 'Retrieves list of users.' })
    @ApiSecurity('access-token')
    @ApiQuery(RetrieveUsersSchema.name)
    @ApiQuery(RetrieveUsersSchema.department)
    @ApiQuery(RetrieveUsersSchema.expireIn)
    @Get('')
    @ApiOkResponse({ type: RetrieveUsersResponseSchema })
    @ApiUnauthorizedResponse({ type: UnauthorizedSchema })
    @ApiForbiddenResponse({ type: ForbiddenSchema })
    @UseGuards(new AdminAuthGuard(['GET']))
    async retrieveUsers(
        @Query('expireIn') expireIn?: string,
        @Query('name') name?: string,
        @Query('department') department?: string,
    ) {
        const users = await this.userService.getUsers(expireIn, name, department)
        let returnedUsers = []
        for (const user of users) {
            const userDetails = {
                username: user.username,
                email: user.email,
                name: user.name,
                department: user.department,
                subscriptionExpiryDate: user.subscriptionExpiryDate,
            }
            returnedUsers.push(userDetails)
        }

        return { users: returnedUsers }
    }

    @ApiOperation({ summary: 'Retrieves a user by username.' })
    @ApiSecurity('access-token')
    @ApiParam(RetrieveUserSchema.username)
    @Get(':username')
    @ApiOkResponse({ type: RetreiveUserResponse })
    @ApiUnauthorizedResponse({ type: UnauthorizedSchema })
    @ApiBadRequestResponse({ type: BadRequestSchema })
    @ApiForbiddenResponse({ type: ForbiddenSchema })
    @UseGuards(new UserAuthGuard(['GET']))
    @UseInterceptors(RetrieveUserInterceptor)
    async retrieveUser(@Param('username') username: string) {
        const user = await this.userService.getUser('user', username)
        const userDetails = {
            username: user.username,
            name: user.name,
            email: user.email,
            department: user.department,
            subscriptionExpiryDate: user.subscriptionExpiryDate,
        }
        return userDetails
    }

    @ApiOperation({ summary: 'Updates a user by username.' })
    @ApiSecurity('access-token')
    @ApiBody({ type: UpdateUserSchema })
    @ApiOkResponse({ type: ServerMessageSchema })
    @ApiBadRequestResponse({ type: BadRequestSchema })
    @ApiForbiddenResponse({ type: ForbiddenSchema })
    @ApiUnauthorizedResponse({ type: UnauthorizedSchema })
    @ApiConflictResponse({ type: ConflictSchema })
    @Put(':username')
    @UseGuards(new UserAuthGuard(['PUT']))
    @UseInterceptors(UpdateUserInterceptor)
    async updateUser(
        @Param('username') oldUsername: string,
        @Body('name') name?: string,
        @Body('username') newUsername?: string,
        @Body('email') email?: string,
        @Body('password') password?: string,
        @Body('department') department?: string,
    ) {
        const user = await this.userService.getUser('user', oldUsername)
        await this.userService.updateUser(user, newUsername, name, email, password, department)
        const response = { message: 'User updated.' }
        return response
    }

    @ApiOperation({ summary: 'Removes a user by username.' })
    @ApiSecurity('access-token')
    @ApiParam(RetrieveUserSchema.username)
    @ApiOkResponse({ type: ServerMessageSchema })
    @ApiBadRequestResponse({ type: BadRequestSchema })
    @ApiUnauthorizedResponse({ type: UnauthorizedSchema })
    @ApiForbiddenResponse({ type: ForbiddenSchema })
    @Delete(':username')
    @UseGuards(new UserAuthGuard(['DELETE']))
    @UseInterceptors(UpdateUserInterceptor)
    async deleteUser(@Param('username') username: string) {
        await this.userService.removeUser(username)
        const response = { message: 'User deleted.' }
        return response
    }

    @ApiOperation({ summary: 'Modify user subscription period.' })
    @ApiSecurity('access-token')
    @ApiBody({ type: ExtendSubscriptionSchema })
    @ApiOkResponse({ type: ServerMessageSchema })
    @ApiBadRequestResponse({ type: BadRequestSchema })
    @ApiUnauthorizedResponse({ type: UnauthorizedSchema })
    @ApiForbiddenResponse({ type: ForbiddenSchema })
    @Put(':username/extend-subscription')
    @UseGuards(new AdminAuthGuard(['PUT']))
    async extendSubscription(
        @Param('username') username: string,
        @Body('extension') extension: string,
    ) {
        const user = (await this.userService.getUser('user', username)) as User
        await this.userService.extendUserSubscription(user, extension)
        const response = { message: 'User subscription extended.' }
        return response
    }
}

@ApiTags('Admins')
@Controller('admins')
export class AdminController {
    constructor(private readonly adminService: UserService) {}

    @ApiOperation({ summary: 'Registers an admin.' })
    @ApiSecurity('access-token')
    @ApiBody({ type: CreateUserSchema })
    @ApiCreatedResponse({ type: ServerMessageSchema })
    @ApiConflictResponse({ type: ConflictSchema })
    @ApiForbiddenResponse({ type: ForbiddenSchema })
    @ApiUnauthorizedResponse({ type: UnauthorizedSchema })
    @ApiBadRequestResponse({ type: BadRequestSchema })
    @Post('register')
    @UseGuards(new AdminAuthGuard(['POST']))
    @UseInterceptors(CreateUserInterceptor)
    async createAdmin(
        @Body('name') name: string,
        @Body('username') username: string,
        @Body('email') email: string,
        @Body('password') password: string,
        @Body('department') department: string,
    ) {
        await this.adminService.addAdmin(username, name, email, password, department)
        const response = { message: 'Admin created.' }
        return response
    }

    @ApiOperation({ summary: 'Authenticate an admin.' })
    @ApiBody({ type: LoginUserSchema })
    @ApiCreatedResponse({ type: LoginUserResponseSchema })
    @ApiBadRequestResponse({ type: BadRequestSchema })
    @Post('login')
    async loginAdmin(@Body('username') username: string, @Body('password') password: string) {
        const accessToken = await this.adminService.verifyAdmin(username, password)
        return { accessToken: accessToken }
    }
}
