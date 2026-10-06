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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SolicitacoesService } from './solicitacoes.service.js';
import { CreateSolicitacaoDto } from './dto/create-solicitacao.dto.js';
import { UpdateSolicitacaoDto } from './dto/update-solicitacao.dto.js';
import { DecidirSolicitacaoDto } from './dto/decidir-solicitacao.dto.js';
import { QuerySolicitacaoDto } from './dto/query-solicitacao.dto.js';

@ApiTags('solicitacoes')
@Controller('solicitacoes')
export class SolicitacoesController {
  constructor(private readonly solicitacoesService: SolicitacoesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova solicitação' })
  @ApiResponse({ status: 201, description: 'Solicitação criada com sucesso' })
  @HttpCode(HttpStatus.CREATED)
  criar(@Body() createDto: CreateSolicitacaoDto) {
    return this.solicitacoesService.criar(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar solicitações com paginação e filtros' })
  @ApiResponse({ status: 200, description: 'Lista de solicitações retornada com sucesso' })
  listar(@Query() query: QuerySolicitacaoDto) {
    return this.solicitacoesService.listar(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma solicitação por ID' })
  @ApiResponse({ status: 200, description: 'Solicitação encontrada' })
  @ApiResponse({ status: 404, description: 'Solicitação não encontrada' })
  buscarPorId(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.solicitacoesService.buscarPorId(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar completamente uma solicitação' })
  @ApiResponse({ status: 200, description: 'Solicitação atualizada' })
  atualizar(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateDto: UpdateSolicitacaoDto,
  ) {
    return this.solicitacoesService.atualizar(id, updateDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar parcialmente uma solicitação' })
  @ApiResponse({ status: 200, description: 'Solicitação atualizada' })
  atualizarParcial(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateDto: UpdateSolicitacaoDto,
  ) {
    return this.solicitacoesService.atualizar(id, updateDto);
  }

  @Patch(':id/decidir')
  @ApiOperation({ summary: 'Decidir sobre uma solicitação (mudar status e registrar histórico)' })
  @ApiResponse({ status: 200, description: 'Decisão registrada' })
  decidir(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() decidirDto: DecidirSolicitacaoDto,
  ) {
    return this.solicitacoesService.decidir(id, decidirDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover (soft delete) uma solicitação' })
  @ApiResponse({ status: 204, description: 'Solicitação removida' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remover(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    await this.solicitacoesService.remover(id);
  }
}

