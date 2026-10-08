import { Perfil } from '../../generated/prisma/enums.js';

export class UsuarioAutenticado {
  id!: string;
  nome!: string;
  perfil!: Perfil;
}

declare global {
  namespace Express {
    interface Request {
      usuario?: UsuarioAutenticado;
    }
  }
}
