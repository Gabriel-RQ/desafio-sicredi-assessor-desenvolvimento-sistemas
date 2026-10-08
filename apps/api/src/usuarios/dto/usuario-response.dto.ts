import { ApiProperty } from '@nestjs/swagger';
import { Perfil } from '../../generated/prisma/enums.js';

export class UsuarioResponseDto {
  @ApiProperty({ example: 'a0000000-0000-0000-0000-000000000001', description: 'ID do usuário' })
  id!: string;

  @ApiProperty({ example: 'Gestora Ana', description: 'Nome do usuário' })
  nome!: string;

  @ApiProperty({ example: 'gestor@sicredi.local', description: 'E-mail do usuário' })
  email!: string;

  @ApiProperty({ enum: Perfil, example: 'gestor', description: 'Perfil de acesso do usuário' })
  perfil!: Perfil;
}
