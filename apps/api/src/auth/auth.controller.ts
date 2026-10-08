import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { LoginResponseDto } from './dto/login-response.dto.js';
import { Publico } from './decorators/publico.decorator.js';
import { UsuarioAtual } from './decorators/usuario-atual.decorator.js';
import { UsuarioAutenticado } from './types/usuario-autenticado.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { UsuarioResponseDto } from '../usuarios/dto/usuario-response.dto.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usuariosService: UsuariosService,
  ) {}

  @Publico()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @UseGuards(ThrottlerGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autenticar usuário e obter token JWT' })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  @ApiResponse({ status: 429, description: 'Muitas tentativas de login' })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Obter dados do usuário autenticado atual' })
  @ApiResponse({
    status: 200,
    description: 'Perfil do usuário atual retornado com sucesso',
    type: UsuarioResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async me(
    @UsuarioAtual() usuario: UsuarioAutenticado,
  ): Promise<UsuarioResponseDto> {
    return this.usuariosService.buscarPorId(usuario.id);
  }
}
