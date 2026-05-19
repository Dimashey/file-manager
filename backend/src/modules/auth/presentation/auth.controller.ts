import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { User } from '../domain/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthTokenDto } from './dto/auth-token.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { Public } from '../../../shared/decorators/public.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { LoginCommand } from '../application/dto/login.command';
import { RegisterUseCase } from '../application/use-cases/register.use-case';
import { RegisterCommand } from '../application/dto/register.command';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUsecase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
  ) {}

  /** Registers a new user account and returns a JWT token */
  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered and token generated',
    type: AuthTokenDto,
  })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() dto: RegisterDto): Promise<AuthTokenDto> {
    return this.registerUseCase.execute(new RegisterCommand(dto.email, dto.password, dto.name));
  }

  /** Authenticates user credentials and returns a JWT token */
  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Authenticate user credentials' })
  @ApiResponse({
    status: 200,
    description: 'User successfully authenticated and token generated',
    type: AuthTokenDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto): Promise<AuthTokenDto> {
    return this.loginUsecase.execute(new LoginCommand(dto.email, dto.password));
  }

  /** Returns the currently authenticated user's profile */
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserProfileDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  me(@CurrentUser() user: User): UserProfileDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
