import { Body, Controller, HttpException, HttpStatus, Post } from "@nestjs/common";
import { UserService } from "./users.service";
import { Debug } from "src/custom/debug/debug";

@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) {}

    /**
     * User registration route
     * Note that server does not check minimum password requirements and email validity 
     * @param name Name of user
     * @param username Username of user
     * @param email Email of user
     * @param password Password of user
     * @param department Department of user
     * @returns Error {@link HttpException} if taken credentials; ID of the user if successful registration
     */
    @Post('register')
    async register(
        @Body('name') name: string,
        @Body('username') username: string,
        @Body('email') email: string,
        @Body('password') password: string,
        @Body('department') department: string
    ) {
        try {
            const userID = await this.userService.insertUser(
                username, 
                name, 
                email, 
                password, 
                department);
            
            if (typeof userID === 'number') {
                if (userID === 1) {
                    throw new HttpException("Conflict (Email Taken)", HttpStatus.CONFLICT)
                } else if (userID === 2) {
                    throw new HttpException("Conflict (Username Taken)", HttpStatus.CONFLICT)
                }
            }
            return { id: userID };
        } catch (err) {
            Debug.devLog(null, err);
            if (err.name === 'ValidationError') {
                throw new HttpException('Bad Request (Incomplete Body)', HttpStatus.BAD_REQUEST)
            }
        }
        
    }

    /**
     * User login route
     * @param username Username of the user
     * @param password Password of the user
     * @returns Error {@link HttpException} if invalid login credentials; Access token if successful login
     */
    @Post('login')
    async login(
        @Body('username') username: string,
        @Body('password') password: string
    ) {
        try {
            const accessToken = await this.userService.verifyUser(username, password);
            if (!accessToken) {
                throw new HttpException("Unauthorised (Invalid Credentials)", HttpStatus.UNAUTHORIZED)
            }
            return { accessToken: accessToken };
        } catch (err) {
            Debug.devLog(null, err);
            if (err.name === 'Error') {
                throw new HttpException('Bad Request (Incomplete Body)', HttpStatus.BAD_REQUEST)
            }
        }
    }
}