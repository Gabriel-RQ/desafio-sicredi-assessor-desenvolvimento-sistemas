import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SolicitacoesService } from './solicitacoes.service.js';
import { CreateSolicitacaoDto } from './dto/create-solicitacao.dto.js';
import { UpdateSolicitacaoDto } from './dto/update-solicitacao.dto.js';
import { DecidirSolicitacaoDto } from './dto/decidir-solicitacao.dto.js';
import { QuerySolicitacaoDto } from './dto/query-solicitacao.dto.js';
import { UsuarioAtual } from '../auth/decorators/usuario-atual.decorator.js';
import { UsuarioAutenticado } from '../auth/types/usuario-autenticado.js';
import { Perfis } from '../auth/decorators/perfis.decorator.js';
import { Perfil } from '../generated/prisma/enums.js';

@ApiBearerAuth()
@ApiTags('solicitacoes')
@ApiResponse({ status: 401, description: 'Não autenticado' })
@Controller('solicitacoes')
export class SolicitacoesController {
  constructor(private readonly solicitacoesService: SolicitacoesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova solicitação' })
  @ApiResponse({ status: 201, description: 'Solicitação criada com sucesso' })
  @HttpCode(HttpStatus.CREATED)
  criar(
    @Body() createDto: CreateSolicitacaoDto,
    @UsuarioAtual() usuario: UsuarioAutenticado,
  ) {
    return this.solicitacoesService.criar(createDto, usuario);
  }

  @Get()
  @ApiOperation({ summary: 'Listar solicitações com paginação e filtros' })
  @ApiResponse({
    status: 200,
    description: 'Lista de solicitações retornada com sucesso',
  })
  listar(
    @Query() query: QuerySolicitacaoDto,
    @UsuarioAtual() usuario: UsuarioAutenticado,
  ) {
    return this.solicitacoesService.listar(query, usuario);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma solicitação por ID' })
  @ApiResponse({ status: 200, description: 'Solicitação encontrada' })
  @ApiResponse({ status: 404, description: 'Solicitação não encontrada' })
  buscarPorId(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @UsuarioAtual() usuario: UsuarioAutenticado,
  ) {
    return this.solicitacoesService.buscarPorId(id, usuario);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar completamente uma solicitação' })
  @ApiResponse({ status: 200, description: 'Solicitação atualizada' })
  @ApiResponse({ status: 403, description: 'Sem permissão para atualizar' })
  atualizar(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateDto: UpdateSolicitacaoDto,
    @UsuarioAtual() usuario: UsuarioAutenticado,
  ) {
    return this.solicitacoesService.atualizar(id, updateDto, usuario);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar parcialmente uma solicitação' })
  @ApiResponse({ status: 200, description: 'Solicitação atualizada' })
  @ApiResponse({ status: 403, description: 'Sem permissão para atualizar' })
  atualizarParcial(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateDto: UpdateSolicitacaoDto,
    @UsuarioAtual() usuario: UsuarioAutenticado,
  ) {
    return this.solicitacoesService.atualizar(id, updateDto, usuario);
  }

  @Patch(':id/decidir')
  @Perfis(Perfil.gestor)
  @ApiOperation({
    summary: 'Decidir sobre uma solicitação (restrito ao perfil gestor)',
  })
  @ApiResponse({ status: 200, description: 'Decisão registrada' })
  @ApiResponse({
    status: 403,
    description: 'Acesso restrito ao perfil de gestor',
  })
  decidir(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() decidirDto: DecidirSolicitacaoDto,
    @UsuarioAtual() usuario: UsuarioAutenticado,
  ) {
    return this.solicitacoesService.decidir(id, decidirDto, usuario);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover (soft delete) uma solicitação' })
  @ApiResponse({ status: 204, description: 'Solicitação removida' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remover(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @UsuarioAtual() usuario: UsuarioAutenticado,
  ) {
    await this.solicitacoesService.remover(id, usuario);
  }
}
