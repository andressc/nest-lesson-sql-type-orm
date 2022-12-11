import { Body, Controller, Get, HttpCode, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from '../application/auth.service';

import { Response } from 'express';
import {
	RefreshTokenDataDto,
	RegistrationConfirmationDto,
	RegistrationDto,
	RegistrationEmailResendingDto,
	NewPasswordDto,
	ResponseTokensDto,
} from '../dto';

import {
	CurrentUserId,
	CurrentUserAgent,
	CurrentUserIp,
	RefreshTokenData,
} from '../../../common/decorators/Param';
import {
	AccessTokenGuard,
	LocalAuthGuard,
	RateLimitGuard,
	RefreshTokenGuard,
} from '../../../common/guards';
import { PasswordRecoveryTokenGuard } from '../../../common/guards';
import { AuthConfig } from '../../../configuration';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RemoveUserSessionCommand } from '../../session/application/commands/remove-user-session.handler';
import { FindMeUserCommand } from '../../users/application/queries/find-me-user.handler';
import { LoginAuthCommand } from '../application/commands/login-auth.handler';
import { RefreshTokenAuthCommand } from '../application/commands/refresh-token-auth.handler';
import { RegistrationAuthCommand } from '../application/commands/registration-auth.handler';
import { RegistrationConfirmationAuthCommand } from '../application/commands/registration-confirmation-auth.handler';
import { RegistrationEmailResendingAuthCommand } from '../application/commands/registration-email-resending-auth.handler';
import { PasswordRecoveryAuthCommand } from '../application/commands/password-recovery-auth.handler';
import { NewPasswordAuthCommand } from '../application/commands/new-password-auth.handler';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly authConfig: AuthConfig,
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus,
	) {}

	@HttpCode(200)
	@UseGuards(RateLimitGuard, LocalAuthGuard)
	@Post('login')
	async login(
		@CurrentUserId() currentUserId: string,
		@CurrentUserIp() ip: string,
		@CurrentUserAgent() userAgent: string,
		@Res({ passthrough: true }) res: Response,
	) {
		const tokens: ResponseTokensDto = await this.commandBus.execute(
			new LoginAuthCommand(currentUserId, ip, userAgent),
		);

		res.cookie(
			this.authConfig.getCookieNameJwt(),
			tokens.refreshToken,
			this.authConfig.getCookieSettings(),
		);
		return { accessToken: tokens.accessToken };
	}

	@UseGuards(AccessTokenGuard)
	@Get('me')
	async getProfile(@CurrentUserId() currentUserId: string) {
		return this.queryBus.execute(new FindMeUserCommand(currentUserId));
	}

	@HttpCode(200)
	@UseGuards(RefreshTokenGuard)
	@Post('refresh-token')
	async refreshToken(
		@RefreshTokenData()
		refreshTokenData: RefreshTokenDataDto,
		@Res({ passthrough: true }) res: Response,
	) {
		const tokens = await this.commandBus.execute(new RefreshTokenAuthCommand(refreshTokenData));

		res.cookie(
			this.authConfig.getCookieNameJwt(),
			tokens.refreshToken,
			this.authConfig.getCookieSettings(),
		);
		return { accessToken: tokens.accessToken };
	}

	@HttpCode(204)
	@UseGuards(RefreshTokenGuard)
	@Post('logout')
	async destroyRefreshToken(
		@RefreshTokenData()
		refreshTokenData: RefreshTokenDataDto,
	) {
		await this.commandBus.execute(
			new RemoveUserSessionCommand(refreshTokenData.userId, refreshTokenData.deviceId),
		);
	}

	@HttpCode(204)
	@UseGuards(RateLimitGuard)
	@Post('registration')
	async registration(@Body() data: RegistrationDto) {
		await this.commandBus.execute(new RegistrationAuthCommand(data));
	}

	@HttpCode(204)
	@UseGuards(RateLimitGuard)
	@Post('registration-confirmation')
	async registrationConfirmation(@Body() data: RegistrationConfirmationDto) {
		await this.commandBus.execute(new RegistrationConfirmationAuthCommand(data));
	}

	@HttpCode(204)
	@UseGuards(RateLimitGuard)
	@Post('registration-email-resending')
	async registrationEmailResending(@Body() data: RegistrationEmailResendingDto) {
		await this.commandBus.execute(new RegistrationEmailResendingAuthCommand(data));
	}

	@HttpCode(204)
	@UseGuards(RateLimitGuard)
	@Post('password-recovery')
	async passwordRecovery(@Body() data: RegistrationEmailResendingDto) {
		await this.commandBus.execute(new PasswordRecoveryAuthCommand(data));
	}

	@HttpCode(204)
	@UseGuards(RateLimitGuard, PasswordRecoveryTokenGuard)
	@Post('new-password')
	async newPassword(@Body() data: NewPasswordDto, @CurrentUserId() currentUserId: string) {
		await this.commandBus.execute(new NewPasswordAuthCommand(data, currentUserId));
	}
}
