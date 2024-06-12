import { Body, Controller, Patch, Post, Put, ValidationPipe } from '@nestjs/common';
import { UserManagementService } from './user-management.service';
import { Get_User_Dto } from './dto/get-user.dto';
import { Create_User_Dto } from './dto/create-user.dto';
import { Sign_In_User_Dto } from './dto/sign-in-user.dto';
import { Update_User_Dto } from './dto/update-user.dto';

@Controller('user-management')
export class UserManagementController {
    constructor(private readonly user_management_service: UserManagementService) {}

    @Put('get-user')
    async getUser(@Body(ValidationPipe) user: Get_User_Dto) {
        return await this.user_management_service.getUser(user);
    }

    @Put('sign-in')
    async signIn(@Body(ValidationPipe) user: Sign_In_User_Dto) {
        return await this.user_management_service.signIn(user);
    }

    @Post('sign-up')
    async signUp(@Body(ValidationPipe) user: Create_User_Dto) {
        return await this.user_management_service.signUp(user);
    }

    @Post('create-user')
    async createUser(@Body(ValidationPipe) user: Create_User_Dto) {
        return await this.user_management_service.createUser(user);
    }

    @Patch('update-user')
    async updateUser(@Body(ValidationPipe) user: Update_User_Dto) {
        return await this.user_management_service.updateUser(user);
    }
}
