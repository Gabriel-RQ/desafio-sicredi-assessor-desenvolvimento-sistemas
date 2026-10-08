import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service.js';
import { HashService } from './hash.service.js';

@Module({
  providers: [UsuariosService, HashService],
  exports: [UsuariosService, HashService],
})
export class UsuariosModule {}
