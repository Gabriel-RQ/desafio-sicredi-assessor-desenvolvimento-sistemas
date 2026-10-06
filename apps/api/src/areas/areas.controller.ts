import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AreasService } from './areas.service.js';
import { AreaResponseDto } from './dto/area-response.dto.js';

@ApiTags('areas')
@Controller('areas')
export class AreasController {
  constructor(private readonly areasService: AreasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as áreas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de áreas retornada com sucesso',
    type: [AreaResponseDto],
  })
  listar(): Promise<AreaResponseDto[]> {
    return this.areasService.listar();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma área por ID' })
  @ApiResponse({
    status: 200,
    description: 'Área encontrada',
    type: AreaResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Área não encontrada' })
  buscarPorId(@Param('id', ParseIntPipe) id: number): Promise<AreaResponseDto> {
    return this.areasService.buscarPorId(id);
  }
}

