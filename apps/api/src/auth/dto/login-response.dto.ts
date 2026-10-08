import { ApiProperty } from '@nestjs/swagger';
import { UsuarioResponseDto } from '../../usuarios/dto/usuario-response.dto.js';

export class LoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token JWT de acesso',
  })
  accessToken!: string;

  @ApiProperty({
    example: 'Bearer',
    description: 'Tipo do token de autenticação',
  })
  tokenType: string = 'Bearer';

  @ApiProperty({
    example: '8h',
    description: 'Tempo de expiração do token',
  })
  expiraEm!: string;

  @ApiProperty({
    type: UsuarioResponseDto,
    description: 'Dados do usuário autenticado',
  })
  usuario!: UsuarioResponseDto;
}
