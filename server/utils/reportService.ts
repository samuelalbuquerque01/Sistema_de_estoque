// server/utils/reportService.ts - VERSÃO COMPLETAMENTE CORRIGIDA
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { Product, Movement, Inventory, Category, Location } from '@shared/schema';

export class ReportService {
  // 🔥 GERAR EXCEL PROFISSIONAL - COMPLETO
  static async generateExcelReport(data: any, reportType: string): Promise<Buffer> {
    console.log(`📊 Iniciando geração do Excel para: ${reportType}`);
    
    try {
      const workbook = new ExcelJS.Workbook();
      
      // Configurações do workbook
      workbook.creator = 'StockMaster';
      workbook.lastModifiedBy = 'StockMaster';
      workbook.created = new Date();
      workbook.modified = new Date();

      // 🎨 ESTILOS PROFISSIONAIS
      const headerStyle = {
        font: { bold: true, color: { argb: 'FFFFFF' }, size: 12 },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '2E86AB' } },
        alignment: { vertical: 'middle', horizontal: 'center' },
        border: {
          top: { style: 'thin', color: { argb: '1E3A5F' } },
          left: { style: 'thin', color: { argb: '1E3A5F' } },
          bottom: { style: 'thin', color: { argb: '1E3A5F' } },
          right: { style: 'thin', color: { argb: '1E3A5F' } }
        }
      };

      const titleStyle = {
        font: { bold: true, size: 16, color: { argb: '2E86AB' } },
        alignment: { vertical: 'middle', horizontal: 'center' }
      };

      // 📊 PLANILHA PRINCIPAL
      const worksheet = workbook.addWorksheet(this.getSheetName(reportType));
      
      // TÍTULO
      worksheet.mergeCells('A1:J1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = `RELATÓRIO: ${reportType.toUpperCase()}`;
      Object.assign(titleCell, titleStyle);

      // DATA DE GERAÇÃO
      worksheet.mergeCells('A2:J2');
      const dateCell = worksheet.getCell('A2');
      dateCell.value = `Gerado em: ${new Date().toLocaleString('pt-BR')}`;
      dateCell.font = { italic: true, color: { argb: '666666' } };
      dateCell.alignment = { horizontal: 'center' };

      worksheet.addRow([]); // Linha em branco

      // 🔥 PROCESSAR DADOS BASEADO NO TIPO DE RELATÓRIO
      let startRow = 4;
      
      switch (reportType) {
        case 'Produtos':
          startRow = this.addProductsToExcel(worksheet, data, headerStyle, startRow);
          break;
        case 'Estoque Baixo':
          startRow = this.addLowStockToExcel(worksheet, data, headerStyle, startRow);
          break;
        case 'Valor Estoque':
          startRow = this.addFinancialToExcel(worksheet, data, headerStyle, startRow);
          break;
        case 'Movimentações':
          startRow = this.addMovementsToExcel(worksheet, data, headerStyle, startRow);
          break;
        case 'Inventários':
          startRow = this.addInventoryToExcel(worksheet, data, headerStyle, startRow);
          break;
        case 'Produtos por Local':
          startRow = this.addProductsByLocationToExcel(worksheet, data, headerStyle, startRow);
          break;
        default:
          startRow = this.addGenericDataToExcel(worksheet, data, headerStyle, startRow);
      }

      // AJUSTAR LARGURA DAS COLUNAS
      worksheet.columns.forEach(column => {
        if (column.values) {
          const maxLength = Math.max(
            ...column.values.map((v: any) => v ? v.toString().length : 0)
          );
          column.width = Math.min(Math.max(maxLength + 2, 10), 50);
        }
      });

      // CONGELAR CABEÇALHOS
      worksheet.views = [
        { state: 'frozen', ySplit: startRow - 1, xSplit: 0 }
      ];

      const buffer = await workbook.xlsx.writeBuffer();
      console.log(`📊 Excel gerado com sucesso, tamanho: ${buffer.length} bytes`);
      return buffer;

    } catch (error) {
      console.error('❌ Erro ao gerar Excel:', error);
      // Fallback: criar um Excel básico com os dados
      return this.generateFallbackExcel(data, reportType);
    }
  }

  // 🔥 MÉTODOS PARA EXCEL - IMPLEMENTADOS COMPLETAMENTE

  private static addProductsToExcel(worksheet: any, data: any, headerStyle: any, startRow: number): number {
    if (!data.produtos || !Array.isArray(data.produtos) || data.produtos.length === 0) {
      worksheet.getCell(`A${startRow}`).value = 'Nenhum produto cadastrado';
      return startRow + 2;
    }

    // CABEÇALHO DA TABELA
    const headers = ['Código', 'Nome', 'Tipo', 'Categoria', 'Localização', 'Quantidade', 'Estoque Mínimo', 'Preço Unitário', 'Valor Total', 'Status'];
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell: any) => Object.assign(cell, headerStyle));

    // DADOS
    data.produtos.forEach((product: any) => {
      const row = worksheet.addRow([
        product.codigo || 'N/A',
        product.nome || 'N/A',
        product.tipo || 'N/A',
        product.categoria || 'N/A',
        product.localizacao || 'N/A',
        product.quantidade || 0,
        product.estoque_minimo || 0,
        this.formatCurrency(product.preco_unitario || 0),
        this.formatCurrency(product.valor_total || 0),
        product.status || 'N/A'
      ]);

      // COLORIR LINHAS COM ESTOQUE BAIXO
      if (product.status === 'SEM ESTOQUE') {
        row.eachCell((cell: any) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E6' } };
        });
      } else if (product.status === 'ESTOQUE BAIXO') {
        row.eachCell((cell: any) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4E6' } };
        });
      }
    });

    // RESUMO
    const summaryRow = startRow + data.produtos.length + 2;
    if (data.resumo) {
      worksheet.getCell(`A${summaryRow}`).value = 'RESUMO';
      worksheet.getCell(`A${summaryRow}`).font = { bold: true, size: 12 };
      
      worksheet.addRow(['Total de Produtos:', data.resumo.total_produtos]);
      worksheet.addRow(['Valor Total do Estoque:', this.formatCurrency(data.resumo.valor_total_estoque)]);
      worksheet.addRow(['Produtos com Estoque Baixo:', data.resumo.produtos_estoque_baixo]);
      worksheet.addRow(['Produtos sem Estoque:', data.resumo.produtos_sem_estoque]);
      worksheet.addRow(['Produtos Normais:', data.resumo.produtos_normais]);
    }

    return summaryRow + 8;
  }

  private static addLowStockToExcel(worksheet: any, data: any, headerStyle: any, startRow: number): number {
    if (!data.produtos || !Array.isArray(data.produtos) || data.produtos.length === 0) {
      worksheet.getCell(`A${startRow}`).value = 'Nenhum produto com estoque baixo';
      return startRow + 2;
    }

    const headers = ['Código', 'Nome', 'Categoria', 'Quant. Atual', 'Estoque Mín.', 'Diferença', 'Preço Unit.', 'Valor em Risco', 'Urgência', 'Ação Recomendada'];
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell: any) => Object.assign(cell, headerStyle));

    data.produtos.forEach((product: any) => {
      const row = worksheet.addRow([
        product.codigo || 'N/A',
        product.nome || 'N/A',
        product.categoria || 'N/A',
        product.quantidade_atual || 0,
        product.estoque_minimo || 0,
        product.diferenca || 0,
        this.formatCurrency(product.preco_unitario || 0),
        this.formatCurrency(product.valor_em_risco || 0),
        product.urgencia || 'N/A',
        product.acao_recomendada || 'N/A'
      ]);

      // COLORIR POR URGÊNCIA
      row.eachCell((cell: any) => {
        if (product.urgencia === 'CRÍTICO') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E6' } };
          cell.font = { bold: true, color: { argb: 'CC0000' } };
        } else {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4E6' } };
        }
      });
    });

    // RESUMO
    const summaryRow = startRow + data.produtos.length + 2;
    if (data.resumo) {
      worksheet.getCell(`A${summaryRow}`).value = 'RESUMO';
      worksheet.getCell(`A${summaryRow}`).font = { bold: true, size: 12 };
      
      worksheet.addRow(['Total Estoque Baixo:', data.resumo.total_estoque_baixo]);
      worksheet.addRow(['Produtos Críticos:', data.resumo.produtos_criticos]);
      worksheet.addRow(['Produtos em Alerta:', data.resumo.produtos_alerta]);
      worksheet.addRow(['Valor Total em Risco:', this.formatCurrency(data.resumo.valor_total_em_risco)]);
    }

    return summaryRow + 6;
  }

  private static addFinancialToExcel(worksheet: any, data: any, headerStyle: any, startRow: number): number {
    // RESUMO FINANCEIRO
    if (data.resumo) {
      worksheet.getCell(`A${startRow}`).value = 'RESUMO FINANCEIRO';
      worksheet.getCell(`A${startRow}`).font = { bold: true, size: 14 };
      startRow++;

      worksheet.addRow(['Valor Total do Estoque:', this.formatCurrency(data.resumo.valor_total_estoque)]);
      worksheet.addRow(['Total de Produtos:', data.resumo.total_produtos]);
      worksheet.addRow(['Valor Médio por Produto:', this.formatCurrency(data.resumo.valor_medio_produto)]);
      worksheet.addRow(['Investimento Total:', this.formatCurrency(data.resumo.investimento_total)]);
      startRow += 5;
    }

    // VALOR POR CATEGORIA
    if (data.valor_por_categoria && Array.isArray(data.valor_por_categoria)) {
      worksheet.getCell(`A${startRow}`).value = 'VALOR POR CATEGORIA';
      worksheet.getCell(`A${startRow}`).font = { bold: true, size: 12 };
      startRow++;

      const headers = ['Categoria', 'Quantidade de Produtos', 'Valor Total', 'Percentual'];
      const headerRow = worksheet.addRow(headers);
      headerRow.eachCell((cell: any) => Object.assign(cell, headerStyle));

      data.valor_por_categoria.forEach((categoria: any) => {
        worksheet.addRow([
          categoria.categoria,
          categoria.quantidade_produtos,
          this.formatCurrency(categoria.valor_total),
          `${categoria.percentual?.toFixed(2) || 0}%`
        ]);
      });
      startRow += data.valor_por_categoria.length + 3;
    }

    // TOP PRODUTOS
    if (data.top_produtos && Array.isArray(data.top_produtos)) {
      worksheet.getCell(`A${startRow}`).value = 'TOP 10 PRODUTOS MAIS VALIOSOS';
      worksheet.getCell(`A${startRow}`).font = { bold: true, size: 12 };
      startRow++;

      const headers = ['Nome', 'Código', 'Categoria', 'Quantidade', 'Preço Unitário', 'Valor Total'];
      const headerRow = worksheet.addRow(headers);
      headerRow.eachCell((cell: any) => Object.assign(cell, headerStyle));

      data.top_produtos.forEach((produto: any) => {
        worksheet.addRow([
          produto.nome,
          produto.codigo,
          produto.categoria,
          produto.quantidade,
          this.formatCurrency(produto.preco_unitario),
          this.formatCurrency(produto.valor_total)
        ]);
      });
    }

    return startRow + (data.top_produtos?.length || 0) + 3;
  }

  private static addMovementsToExcel(worksheet: any, data: any, headerStyle: any, startRow: number): number {
    if (!data.movimentacoes || !Array.isArray(data.movimentacoes) || data.movimentacoes.length === 0) {
      worksheet.getCell(`A${startRow}`).value = 'Nenhuma movimentação encontrada';
      return startRow + 2;
    }

    // RESUMO
    if (data.resumo) {
      worksheet.getCell(`A${startRow}`).value = 'RESUMO DE MOVIMENTAÇÕES';
      worksheet.getCell(`A${startRow}`).font = { bold: true, size: 12 };
      startRow++;

      worksheet.addRow(['Período:', `${data.periodo?.inicio} a ${data.periodo?.fim}`]);
      worksheet.addRow(['Total de Movimentações:', data.resumo.total_movimentacoes]);
      worksheet.addRow(['Entradas:', data.resumo.entradas]);
      worksheet.addRow(['Saídas:', data.resumo.saidas]);
      worksheet.addRow(['Ajustes:', data.resumo.ajustes]);
      worksheet.addRow(['Quantidade Total Entrada:', data.resumo.quantidade_total_entrada]);
      worksheet.addRow(['Quantidade Total Saída:', data.resumo.quantidade_total_saida]);
      worksheet.addRow(['Saldo:', data.resumo.saldo]);
      startRow += 9;
    }

    // MOVIMENTAÇÕES
    worksheet.getCell(`A${startRow}`).value = 'DETALHES DAS MOVIMENTAÇÕES';
    worksheet.getCell(`A${startRow}`).font = { bold: true, size: 12 };
    startRow++;

    const headers = ['Produto', 'Código', 'Tipo', 'Quantidade', 'Data', 'Hora', 'Observações'];
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell: any) => Object.assign(cell, headerStyle));

    data.movimentacoes.forEach((mov: any) => {
      const row = worksheet.addRow([
        mov.produto,
        mov.codigo_produto,
        mov.tipo,
        mov.quantidade,
        mov.data,
        mov.hora,
        mov.observacoes
      ]);

      // COLORIR POR TIPO
      if (mov.tipo === 'ENTRADA') {
        row.eachCell((cell: any) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E8F5E8' } };
        });
      } else if (mov.tipo === 'SAÍDA') {
        row.eachCell((cell: any) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E6' } };
        });
      }
    });

    return startRow + data.movimentacoes.length + 3;
  }

  private static addInventoryToExcel(worksheet: any, data: any, headerStyle: any, startRow: number): number {
    if (!data.inventarios || !Array.isArray(data.inventarios) || data.inventarios.length === 0) {
      worksheet.getCell(`A${startRow}`).value = 'Nenhum inventário encontrado';
      return startRow + 2;
    }

    // RESUMO
    if (data.resumo) {
      worksheet.getCell(`A${startRow}`).value = 'RESUMO DE INVENTÁRIOS';
      worksheet.getCell(`A${startRow}`).font = { bold: true, size: 12 };
      startRow++;

      worksheet.addRow(['Total de Inventários:', data.resumo.total_inventarios]);
      worksheet.addRow(['Inventários Finalizados:', data.resumo.inventarios_finalizados]);
      worksheet.addRow(['Inventários em Andamento:', data.resumo.inventarios_andamento]);
      worksheet.addRow(['Precisão Geral:', data.resumo.precisao_geral]);
      startRow += 5;
    }

    // INVENTÁRIOS
    worksheet.getCell(`A${startRow}`).value = 'DETALHES DOS INVENTÁRIOS';
    worksheet.getCell(`A${startRow}`).font = { bold: true, size: 12 };
    startRow++;

    const headers = ['Nome', 'Status', 'Data Início', 'Data Fim', 'Total Produtos', 'Produtos c/ Divergência', 'Precisão'];
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell: any) => Object.assign(cell, headerStyle));

    data.inventarios.forEach((inv: any) => {
      const row = worksheet.addRow([
        inv.nome,
        inv.status,
        inv.data_inicio,
        inv.data_fim,
        inv.total_produtos,
        inv.produtos_com_divergencia,
        inv.precisao
      ]);

      // COLORIR POR STATUS
      if (inv.status === 'FINALIZADO') {
        row.eachCell((cell: any) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E8F5E8' } };
        });
      }
    });

    return startRow + data.inventarios.length + 3;
  }

  private static addProductsByLocationToExcel(worksheet: any, data: any, headerStyle: any, startRow: number): number {
    if (!data.produtos_por_local || !Array.isArray(data.produtos_por_local) || data.produtos_por_local.length === 0) {
      worksheet.getCell(`A${startRow}`).value = 'Nenhum local com produtos encontrado';
      return startRow + 2;
    }

    // RESUMO GERAL
    if (data.resumo_geral) {
      worksheet.getCell(`A${startRow}`).value = 'RESUMO GERAL';
      worksheet.getCell(`A${startRow}`).font = { bold: true, size: 12 };
      startRow++;

      worksheet.addRow(['Total de Locais:', data.resumo_geral.total_locais]);
      worksheet.addRow(['Total de Produtos:', data.resumo_geral.total_produtos]);
      worksheet.addRow(['Valor Total do Estoque:', this.formatCurrency(data.resumo_geral.valor_total_estoque)]);
      worksheet.addRow(['Local Mais Valioso:', data.resumo_geral.local_mais_valioso]);
      worksheet.addRow(['Local com Mais Produtos:', data.resumo_geral.local_mais_produtos]);
      startRow += 6;
    }

    // PRODUTOS POR LOCAL
    data.produtos_por_local.forEach((local: any) => {
      worksheet.getCell(`A${startRow}`).value = `LOCAL: ${local.local}`;
      worksheet.getCell(`A${startRow}`).font = { bold: true, size: 11 };
      startRow++;

      if (local.resumo) {
        worksheet.addRow(['Descrição:', local.descricao]);
        worksheet.addRow(['Total de Produtos:', local.resumo.total_produtos]);
        worksheet.addRow(['Quantidade Total:', local.resumo.quantidade_total]);
        worksheet.addRow(['Valor Total:', this.formatCurrency(local.resumo.valor_total)]);
        worksheet.addRow(['Produtos com Estoque Baixo:', local.resumo.produtos_estoque_baixo]);
        startRow += 6;
      }

      // PRODUTOS DO LOCAL
      if (local.produtos && Array.isArray(local.produtos) && local.produtos.length > 0) {
        const headers = ['Código', 'Nome', 'Categoria', 'Quantidade', 'Preço Unitário', 'Valor Total', 'Status'];
        const headerRow = worksheet.addRow(headers);
        headerRow.eachCell((cell: any) => Object.assign(cell, headerStyle));

        local.produtos.forEach((produto: any) => {
          const row = worksheet.addRow([
            produto.codigo,
            produto.nome,
            produto.categoria,
            produto.quantidade,
            this.formatCurrency(produto.preco_unitario),
            this.formatCurrency(produto.valor_total),
            produto.status
          ]);

          // COLORIR POR STATUS
          if (produto.status === 'ESTOQUE BAIXO') {
            row.eachCell((cell: any) => {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4E6' } };
            });
          }
        });
        startRow += local.produtos.length + 2;
      }

      worksheet.addRow([]); // Linha em branco entre locais
      startRow++;
    });

    return startRow;
  }

  // 🔥 GERAR PDF PROFISSIONAL - COMPLETAMENTE IMPLEMENTADO
  static async generatePDFReport(data: any, reportType: string): Promise<Buffer> {
    console.log(`📊 Iniciando geração do PDF para: ${reportType}`);
    
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'portrait' });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // 🎨 CABEÇALHO PROFISSIONAL
        doc.fillColor('#2E86AB')
           .fontSize(20)
           .font('Helvetica-Bold')
           .text('STOCKMASTER', 50, 50, { align: 'center' });

        doc.fillColor('#1E3A5F')
           .fontSize(16)
           .text(reportType.toUpperCase(), 50, 80, { align: 'center' });

        doc.fillColor('#666666')
           .fontSize(10)
           .text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 50, 110, { align: 'center' });

        // LINHA SEPARADORA
        doc.moveTo(50, 130)
           .lineTo(545, 130)
           .strokeColor('#2E86AB')
           .lineWidth(2)
           .stroke();

        let yPosition = 160;

        // 🔥 PROCESSAR DADOS BASEADO NO TIPO - COMPLETO
        switch (reportType) {
          case 'Produtos':
            yPosition = this.addProductsToPDF(doc, data, yPosition);
            break;
          case 'Estoque Baixo':
            yPosition = this.addLowStockToPDF(doc, data, yPosition);
            break;
          case 'Valor Estoque':
            yPosition = this.addFinancialToPDF(doc, data, yPosition);
            break;
          case 'Movimentações':
            yPosition = this.addMovementsToPDF(doc, data, yPosition);
            break;
          case 'Inventários':
            yPosition = this.addInventoryToPDF(doc, data, yPosition);
            break;
          case 'Produtos por Local':
            yPosition = this.addProductsByLocationToPDF(doc, data, yPosition);
            break;
          default:
            yPosition = this.addGenericToPDF(doc, data, yPosition);
        }

        // RODAPÉ EM TODAS AS PÁGINAS
        const addFooter = (pageNumber: number) => {
          const pageHeight = doc.page.height;
          doc.fillColor('#666666')
             .fontSize(8)
             .text(`Página ${pageNumber}`, 50, pageHeight - 30, { align: 'center' })
             .text('Sistema StockMaster - Controle de Estoque', 50, pageHeight - 20, { align: 'center' });
        };

        // Adicionar footer à primeira página
        addFooter(1);

        // Configurar footer para páginas subsequentes
        doc.on('pageAdded', () => {
          addFooter(doc.page.number);
        });

        doc.end();
        console.log(`📊 PDF gerado com sucesso`);

      } catch (error) {
        console.error('❌ Erro ao gerar PDF:', error);
        reject(error);
      }
    });
  }

  // 🔥 MÉTODOS PARA PDF - COMPLETAMENTE IMPLEMENTADOS

  private static addProductsToPDF(doc: any, data: any, yPosition: number): number {
    if (!data.produtos || !Array.isArray(data.produtos) || data.produtos.length === 0) {
      doc.font('Helvetica').fontSize(12).text('Nenhum produto cadastrado', 50, yPosition);
      return yPosition + 30;
    }

    // RESUMO
    doc.font('Helvetica-Bold').fontSize(14).text('RESUMO', 50, yPosition);
    yPosition += 20;

    if (data.resumo) {
      doc.font('Helvetica').fontSize(10)
         .text(`Total de Produtos: ${data.resumo.total_produtos}`, 60, yPosition)
         .text(`Valor Total do Estoque: R$ ${this.formatCurrency(data.resumo.valor_total_estoque)}`, 250, yPosition);
      yPosition += 15;
      
      doc.text(`Produtos com Estoque Baixo: ${data.resumo.produtos_estoque_baixo}`, 60, yPosition)
         .text(`Produtos sem Estoque: ${data.resumo.produtos_sem_estoque}`, 250, yPosition);
      yPosition += 15;
      
      doc.text(`Produtos Normais: ${data.resumo.produtos_normais}`, 60, yPosition);
      yPosition += 25;
    }

    // LISTA DE PRODUTOS
    doc.font('Helvetica-Bold').fontSize(12).text('LISTA DE PRODUTOS', 50, yPosition);
    yPosition += 20;

    // CABEÇALHO DA TABELA
    const startX = 50;
    const colWidths = [50, 120, 80, 60, 40, 50, 50];
    
    // Fundo do cabeçalho
    doc.fillColor('#2E86AB')
       .rect(startX, yPosition, 495, 20)
       .fill();
    
    // Texto do cabeçalho
    doc.fillColor('#FFFFFF')
       .fontSize(9)
       .font('Helvetica-Bold')
       .text('Código', startX + 5, yPosition + 7)
       .text('Nome', startX + colWidths[0], yPosition + 7)
       .text('Categoria', startX + colWidths[0] + colWidths[1], yPosition + 7)
       .text('Local', startX + colWidths[0] + colWidths[1] + colWidths[2], yPosition + 7)
       .text('Quant.', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], yPosition + 7)
       .text('Preço', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], yPosition + 7)
       .text('Status', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5], yPosition + 7);

    yPosition += 25;

    // DADOS
    data.produtos.forEach((product: any, index: number) => {
      // Verificar se precisa de nova página
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
        // Adicionar cabeçalho novamente
        doc.fillColor('#2E86AB').rect(startX, yPosition, 495, 20).fill();
        doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold')
           .text('Código', startX + 5, yPosition + 7)
           .text('Nome', startX + colWidths[0], yPosition + 7)
           .text('Categoria', startX + colWidths[0] + colWidths[1], yPosition + 7)
           .text('Local', startX + colWidths[0] + colWidths[1] + colWidths[2], yPosition + 7)
           .text('Quant.', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], yPosition + 7)
           .text('Preço', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], yPosition + 7)
           .text('Status', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5], yPosition + 7);
        yPosition += 25;
      }

      // COR DE FUNDO ALTERNADA
      if (index % 2 === 0) {
        doc.fillColor('#F8F9FA')
           .rect(startX, yPosition, 495, 15)
           .fill();
      }

      // COR POR STATUS
      let textColor = '#333333';
      if (product.status === 'SEM ESTOQUE') {
        doc.fillColor('#FFE6E6').rect(startX, yPosition, 495, 15).fill();
        textColor = '#CC0000';
      } else if (product.status === 'ESTOQUE BAIXO') {
        doc.fillColor('#FFF4E6').rect(startX, yPosition, 495, 15).fill();
        textColor = '#E67E22';
      }

      doc.fillColor(textColor)
         .fontSize(8)
         .text(product.codigo || 'N/A', startX + 5, yPosition + 4)
         .text(this.truncateText(product.nome, 25), startX + colWidths[0], yPosition + 4)
         .text(this.truncateText(product.categoria, 15), startX + colWidths[0] + colWidths[1], yPosition + 4)
         .text(this.truncateText(product.localizacao, 12), startX + colWidths[0] + colWidths[1] + colWidths[2], yPosition + 4)
         .text(product.quantidade?.toString() || '0', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], yPosition + 4)
         .text(`R$ ${this.formatCurrency(product.preco_unitario)}`, startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], yPosition + 4)
         .text(product.status || 'N/A', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5], yPosition + 4);

      yPosition += 18;
    });

    return yPosition + 20;
  }

  private static addLowStockToPDF(doc: any, data: any, yPosition: number): number {
    if (!data.produtos || !Array.isArray(data.produtos) || data.produtos.length === 0) {
      doc.font('Helvetica').fontSize(12).text('Nenhum produto com estoque baixo encontrado', 50, yPosition);
      return yPosition + 30;
    }

    // RESUMO
    doc.font('Helvetica-Bold').fontSize(14).text('RESUMO - ESTOQUE BAIXO', 50, yPosition);
    yPosition += 20;

    if (data.resumo) {
      doc.font('Helvetica').fontSize(10)
         .text(`Total de Produtos com Estoque Baixo: ${data.resumo.total_estoque_baixo}`, 60, yPosition)
         .text(`Produtos Críticos (Sem Estoque): ${data.resumo.produtos_criticos}`, 250, yPosition);
      yPosition += 15;
      
      doc.text(`Produtos em Alerta: ${data.resumo.produtos_alerta}`, 60, yPosition)
         .text(`Valor Total em Risco: R$ ${this.formatCurrency(data.resumo.valor_total_em_risco)}`, 250, yPosition);
      yPosition += 25;
    }

    // LISTA DE PRODUTOS
    doc.font('Helvetica-Bold').fontSize(12).text('PRODUTOS COM ESTOQUE BAIXO', 50, yPosition);
    yPosition += 20;

    // CABEÇALHO DA TABELA
    const startX = 50;
    const colWidths = [50, 120, 80, 40, 40, 40, 60, 50, 50];
    
    doc.fillColor('#FF6B6B')
       .rect(startX, yPosition, 495, 20)
       .fill();
    
    doc.fillColor('#FFFFFF')
       .fontSize(9)
       .font('Helvetica-Bold')
       .text('Código', startX + 5, yPosition + 7)
       .text('Nome', startX + colWidths[0], yPosition + 7)
       .text('Categoria', startX + colWidths[0] + colWidths[1], yPosition + 7)
       .text('Atual', startX + colWidths[0] + colWidths[1] + colWidths[2], yPosition + 7)
       .text('Mín.', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], yPosition + 7)
       .text('Diff.', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], yPosition + 7)
       .text('Preço', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5], yPosition + 7)
       .text('Urgência', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5] + colWidths[6], yPosition + 7);

    yPosition += 25;

    // DADOS
    data.produtos.forEach((product: any, index: number) => {
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
        // Recriar cabeçalho...
      }

      // COR POR URGÊNCIA
      if (product.urgencia === 'CRÍTICO') {
        doc.fillColor('#FFE6E6').rect(startX, yPosition, 495, 15).fill();
      } else {
        doc.fillColor('#FFF4E6').rect(startX, yPosition, 495, 15).fill();
      }

      let textColor = product.urgencia === 'CRÍTICO' ? '#CC0000' : '#E67E22';

      doc.fillColor(textColor)
         .fontSize(8)
         .text(product.codigo || 'N/A', startX + 5, yPosition + 4)
         .text(this.truncateText(product.nome, 25), startX + colWidths[0], yPosition + 4)
         .text(this.truncateText(product.categoria, 15), startX + colWidths[0] + colWidths[1], yPosition + 4)
         .text(product.quantidade_atual?.toString() || '0', startX + colWidths[0] + colWidths[1] + colWidths[2], yPosition + 4)
         .text(product.estoque_minimo?.toString() || '0', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], yPosition + 4)
         .text(product.diferenca?.toString() || '0', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], yPosition + 4)
         .text(`R$ ${this.formatCurrency(product.preco_unitario)}`, startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5], yPosition + 4)
         .text(product.urgencia || 'N/A', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5] + colWidths[6], yPosition + 4);

      yPosition += 18;
    });

    return yPosition + 20;
  }

  private static addFinancialToPDF(doc: any, data: any, yPosition: number): number {
    // RESUMO FINANCEIRO
    doc.font('Helvetica-Bold').fontSize(14).text('RESUMO FINANCEIRO', 50, yPosition);
    yPosition += 20;

    if (data.resumo) {
      doc.font('Helvetica').fontSize(11)
         .text(`Valor Total do Estoque: R$ ${this.formatCurrency(data.resumo.valor_total_estoque)}`, 60, yPosition);
      yPosition += 15;
      
      doc.text(`Total de Produtos: ${data.resumo.total_produtos}`, 60, yPosition)
         .text(`Valor Médio por Produto: R$ ${this.formatCurrency(data.resumo.valor_medio_produto)}`, 250, yPosition);
      yPosition += 15;
      
      doc.text(`Investimento Total: R$ ${this.formatCurrency(data.resumo.investimento_total)}`, 60, yPosition);
      yPosition += 25;
    }

    // VALOR POR CATEGORIA
    if (data.valor_por_categoria && Array.isArray(data.valor_por_categoria)) {
      doc.font('Helvetica-Bold').fontSize(12).text('VALOR POR CATEGORIA', 50, yPosition);
      yPosition += 20;

      data.valor_por_categoria.forEach((categoria: any) => {
        doc.font('Helvetica').fontSize(10)
           .text(`${categoria.categoria}:`, 60, yPosition)
           .text(`R$ ${this.formatCurrency(categoria.valor_total)}`, 200, yPosition)
           .text(`(${categoria.quantidade_produtos} produtos - ${categoria.percentual?.toFixed(1)}%)`, 300, yPosition);
        yPosition += 15;
      });
      yPosition += 10;
    }

    // TOP PRODUTOS
    if (data.top_produtos && Array.isArray(data.top_produtos)) {
      doc.font('Helvetica-Bold').fontSize(12).text('TOP 10 PRODUTOS MAIS VALIOSOS', 50, yPosition);
      yPosition += 20;

      data.top_produtos.forEach((produto: any, index: number) => {
        doc.font('Helvetica').fontSize(9)
           .text(`${index + 1}. ${produto.nome}`, 60, yPosition)
           .text(`R$ ${this.formatCurrency(produto.valor_total)}`, 350, yPosition);
        yPosition += 12;
      });
    }

    return yPosition + 20;
  }

  private static addMovementsToPDF(doc: any, data: any, yPosition: number): number {
    if (!data.movimentacoes || !Array.isArray(data.movimentacoes) || data.movimentacoes.length === 0) {
      doc.font('Helvetica').fontSize(12).text('Nenhuma movimentação encontrada', 50, yPosition);
      return yPosition + 30;
    }

    // RESUMO
    doc.font('Helvetica-Bold').fontSize(14).text('RESUMO DE MOVIMENTAÇÕES', 50, yPosition);
    yPosition += 20;

    if (data.resumo) {
      doc.font('Helvetica').fontSize(10)
         .text(`Período: ${data.periodo?.inicio} a ${data.periodo?.fim}`, 60, yPosition);
      yPosition += 15;
      
      doc.text(`Total de Movimentações: ${data.resumo.total_movimentacoes}`, 60, yPosition)
         .text(`Entradas: ${data.resumo.entradas}`, 200, yPosition)
         .text(`Saídas: ${data.resumo.saidas}`, 300, yPosition)
         .text(`Ajustes: ${data.resumo.ajustes}`, 400, yPosition);
      yPosition += 15;
      
      doc.text(`Quantidade Total Entrada: ${data.resumo.quantidade_total_entrada}`, 60, yPosition)
         .text(`Quantidade Total Saída: ${data.resumo.quantidade_total_saida}`, 250, yPosition)
         .text(`Saldo: ${data.resumo.saldo}`, 400, yPosition);
      yPosition += 25;
    }

    // MOVIMENTAÇÕES
    doc.font('Helvetica-Bold').fontSize(12).text('DETALHES DAS MOVIMENTAÇÕES', 50, yPosition);
    yPosition += 20;

    data.movimentacoes.forEach((mov: any, index: number) => {
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }

      let bgColor = '#F8F9FA';
      let textColor = '#333333';
      
      if (mov.tipo === 'ENTRADA') {
        bgColor = '#E8F5E8';
        textColor = '#27AE60';
      } else if (mov.tipo === 'SAÍDA') {
        bgColor = '#FFE6E6';
        textColor = '#E74C3C';
      }

      doc.fillColor(bgColor)
         .rect(50, yPosition, 495, 25)
         .fill();

      doc.fillColor(textColor)
         .fontSize(9)
         .text(mov.produto, 55, yPosition + 5)
         .text(mov.tipo, 250, yPosition + 5)
         .text(`Quantidade: ${mov.quantidade}`, 320, yPosition + 5)
         .text(mov.data, 420, yPosition + 5)
         .text(mov.hora, 480, yPosition + 5);

      if (mov.observacoes && mov.observacoes !== 'Sem observações') {
        doc.fillColor('#666666')
           .fontSize(8)
           .text(`Obs: ${mov.observacoes}`, 55, yPosition + 15);
      }

      yPosition += 30;
    });

    return yPosition + 20;
  }

  private static addInventoryToPDF(doc: any, data: any, yPosition: number): number {
    if (!data.inventarios || !Array.isArray(data.inventarios) || data.inventarios.length === 0) {
      doc.font('Helvetica').fontSize(12).text('Nenhum inventário encontrado', 50, yPosition);
      return yPosition + 30;
    }

    // RESUMO
    doc.font('Helvetica-Bold').fontSize(14).text('RESUMO DE INVENTÁRIOS', 50, yPosition);
    yPosition += 20;

    if (data.resumo) {
      doc.font('Helvetica').fontSize(10)
         .text(`Total de Inventários: ${data.resumo.total_inventarios}`, 60, yPosition)
         .text(`Inventários Finalizados: ${data.resumo.inventarios_finalizados}`, 250, yPosition)
         .text(`Inventários em Andamento: ${data.resumo.inventarios_andamento}`, 400, yPosition);
      yPosition += 15;
      
      doc.text(`Precisão Geral: ${data.resumo.precisao_geral}`, 60, yPosition);
      yPosition += 25;
    }

    // INVENTÁRIOS
    doc.font('Helvetica-Bold').fontSize(12).text('DETALHES DOS INVENTÁRIOS', 50, yPosition);
    yPosition += 20;

    data.inventarios.forEach((inv: any, index: number) => {
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }

      const bgColor = inv.status === 'FINALIZADO' ? '#E8F5E8' : '#FFF4E6';
      
      doc.fillColor(bgColor)
         .rect(50, yPosition, 495, 40)
         .fill();

      doc.fillColor('#333333')
         .fontSize(10)
         .text(inv.nome, 55, yPosition + 5)
         .text(`Status: ${inv.status}`, 300, yPosition + 5)
         .text(`Precisão: ${inv.precisao}`, 420, yPosition + 5)
         .text(`Data Início: ${inv.data_inicio}`, 55, yPosition + 18)
         .text(`Data Fim: ${inv.data_fim}`, 200, yPosition + 18)
         .text(`Total Produtos: ${inv.total_produtos}`, 350, yPosition + 18)
         .text(`Divergências: ${inv.produtos_com_divergencia}`, 450, yPosition + 18);

      yPosition += 45;
    });

    return yPosition + 20;
  }

  private static addProductsByLocationToPDF(doc: any, data: any, yPosition: number): number {
    if (!data.produtos_por_local || !Array.isArray(data.produtos_por_local) || data.produtos_por_local.length === 0) {
      doc.font('Helvetica').fontSize(12).text('Nenhum local com produtos encontrado', 50, yPosition);
      return yPosition + 30;
    }

    // RESUMO GERAL
    doc.font('Helvetica-Bold').fontSize(14).text('RESUMO GERAL', 50, yPosition);
    yPosition += 20;

    if (data.resumo_geral) {
      doc.font('Helvetica').fontSize(10)
         .text(`Total de Locais: ${data.resumo_geral.total_locais}`, 60, yPosition)
         .text(`Total de Produtos: ${data.resumo_geral.total_produtos}`, 250, yPosition)
         .text(`Valor Total: R$ ${this.formatCurrency(data.resumo_geral.valor_total_estoque)}`, 400, yPosition);
      yPosition += 15;
      
      doc.text(`Local Mais Valioso: ${data.resumo_geral.local_mais_valioso}`, 60, yPosition)
         .text(`Local com Mais Produtos: ${data.resumo_geral.local_mais_produtos}`, 300, yPosition);
      yPosition += 25;
    }

    // PRODUTOS POR LOCAL
    data.produtos_por_local.forEach((local: any) => {
      if (yPosition > 650) {
        doc.addPage();
        yPosition = 50;
      }

      doc.font('Helvetica-Bold').fontSize(12).text(`LOCAL: ${local.local}`, 50, yPosition);
      yPosition += 15;
      
      doc.font('Helvetica').fontSize(10).text(`Descrição: ${local.descricao}`, 60, yPosition);
      yPosition += 15;

      if (local.resumo) {
        doc.text(`Total de Produtos: ${local.resumo.total_produtos}`, 60, yPosition)
           .text(`Quantidade Total: ${local.resumo.quantidade_total}`, 200, yPosition)
           .text(`Valor Total: R$ ${this.formatCurrency(local.resumo.valor_total)}`, 350, yPosition)
           .text(`Estoque Baixo: ${local.resumo.produtos_estoque_baixo}`, 480, yPosition);
        yPosition += 20;
      }

      // PRODUTOS DO LOCAL (apenas resumo se houver muitos)
      if (local.produtos && Array.isArray(local.produtos)) {
        if (local.produtos.length <= 10) {
          local.produtos.forEach((produto: any) => {
            if (yPosition > 700) {
              doc.addPage();
              yPosition = 50;
            }
            
            doc.font('Helvetica').fontSize(8)
               .text(`• ${produto.nome}`, 70, yPosition)
               .text(`Quant: ${produto.quantidade}`, 250, yPosition)
               .text(`Preço: R$ ${this.formatCurrency(produto.preco_unitario)}`, 320, yPosition)
               .text(`Status: ${produto.status}`, 420, yPosition);
            yPosition += 12;
          });
        } else {
          doc.font('Helvetica').fontSize(9).text(`... ${local.produtos.length} produtos neste local`, 70, yPosition);
          yPosition += 15;
        }
      }

      yPosition += 15; // Espaço entre locais
    });

    return yPosition + 20;
  }

  // 🔥 MÉTODOS AUXILIARES

  private static addGenericDataToExcel(worksheet: any, data: any, headerStyle: any, startRow: number): number {
    // Fallback genérico para Excel
    if (typeof data === 'object') {
      const headers = Object.keys(data);
      const headerRow = worksheet.addRow(headers);
      headerRow.eachCell((cell: any) => Object.assign(cell, headerStyle));

      const values = Object.values(data).map(v => 
        typeof v === 'object' ? JSON.stringify(v) : String(v)
      );
      worksheet.addRow(values);
    } else {
      worksheet.getCell(`A${startRow}`).value = 'Dados não disponíveis';
    }
    return startRow + 3;
  }

  private static addGenericToPDF(doc: any, data: any, yPosition: number): number {
    // Fallback genérico para PDF
    doc.font('Helvetica').fontSize(12).text('Relatório Genérico', 50, yPosition);
    if (data && typeof data === 'object') {
      Object.entries(data).forEach(([key, value]) => {
        yPosition += 15;
        const text = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
        doc.text(`${key}: ${this.truncateText(text, 100)}`, 50, yPosition);
      });
    }
    return yPosition + 30;
  }

  private static async generateFallbackExcel(data: any, reportType: string): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Relatório');
    
    worksheet.getCell('A1').value = `RELATÓRIO: ${reportType}`;
    worksheet.getCell('A2').value = `Gerado em: ${new Date().toLocaleString('pt-BR')}`;
    
    if (data && typeof data === 'object') {
      let row = 4;
      Object.entries(data).forEach(([key, value]) => {
        worksheet.getCell(`A${row}`).value = key;
        if (typeof value === 'object') {
          worksheet.getCell(`B${row}`).value = JSON.stringify(value);
        } else {
          worksheet.getCell(`B${row}`).value = String(value);
        }
        row++;
      });
    } else {
      worksheet.getCell('A4').value = 'Nenhum dado disponível';
    }

    return await workbook.xlsx.writeBuffer();
  }

  private static formatCurrency(value: any): string {
    const num = typeof value === 'string' ? parseFloat(value) : Number(value);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  }

  private static truncateText(text: string, maxLength: number): string {
    if (!text) return 'N/A';
    return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
  }

  private static getSheetName(reportType: string): string {
    const names: { [key: string]: string } = {
      'Produtos': 'Produtos',
      'Estoque Baixo': 'Estoque_Baixo',
      'Valor Estoque': 'Valor_Estoque',
      'Movimentações': 'Movimentacoes',
      'Inventários': 'Inventarios',
      'Produtos por Local': 'Produtos_por_Local'
    };
    return names[reportType] || 'Relatorio';
  }
}

export default ReportService;