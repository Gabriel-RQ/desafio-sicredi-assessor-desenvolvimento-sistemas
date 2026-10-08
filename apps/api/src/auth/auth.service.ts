import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { HashService } from '../usuarios/hash.service.js';
import { LoginDto } from './dto/login.dto.js';
import { LoginResponseDto } from './dto/login-response.dto.js';

// Hash fictício pré-computado para mitigar ataques de temporização quando o usuário não existe
const HASH_FICTICIO =
  'scrypt$00000000000000000000000000000000$00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const emailNormalizado = loginDto.email.trim().toLowerCase();
    const usuario = await this.usuariosService.buscarPorEmail(emailNormalizado);

    if (!usuario) {
      await this.hashService.comparar(loginDto.senha, HASH_FICTICIO);
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    if (!usuario.ativo) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const senhaValida = await this.hashService.comparar(
      loginDto.senha,
      usuario.senhaHash,
    );

    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const payload = {
      sub: usuario.id,
      nome: usuario.nome,
      perfil: usuario.perfil,
    };

    const expiraEm = this.configService.get<string>('JWT_EXPIRES_IN', '8h');
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      tokenType: 'Bearer',
      expiraEm,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
      },
    };
  }
}
