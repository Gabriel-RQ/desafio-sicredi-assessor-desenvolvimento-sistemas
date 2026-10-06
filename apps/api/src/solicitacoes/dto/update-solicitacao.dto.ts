import { PartialType } from '@nestjs/swagger';
import { CreateSolicitacaoDto } from './create-solicitacao.dto.js';

export class UpdateSolicitacaoDto extends PartialType(CreateSolicitacaoDto) {}

