import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private otpService: OtpService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('send-otp')
  async sendOtp(
    @Request() req,
    @Body() body: { phoneNumber: string },
  ) {
    return this.otpService.sendOtp(req.user.userId, body.phoneNumber);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-otp')
  async verifyOtp(
    @Request() req,
    @Body() body: { otpId: string; otpCode: string; phoneNumber: string },
  ) {
    return this.otpService.verifyOtp(
      req.user.userId,
      body.otpId,
      body.otpCode,
      body.phoneNumber,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('resend-otp')
  async resendOtp(
    @Request() req,
    @Body() body: { otpId: string },
  ) {
    return this.otpService.resendOtp(req.user.userId, body.otpId);
  }
}