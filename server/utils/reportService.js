"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
// server/utils/reportService.ts
var exceljs_1 = require("exceljs");
var pdfkit_1 = require("pdfkit");
var ReportService = /** @class */ (function () {
    function ReportService() {
    }
    ReportService.generateExcelReport = function (data, reportType) {
        return __awaiter(this, void 0, void 0, function () {
            var workbook, headerStyle, titleStyle, worksheet, titleCell, dateCell, startRow, buffer, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        workbook = new exceljs_1.default.Workbook();
                        workbook.creator = 'Neuropsicocentro';
                        workbook.lastModifiedBy = 'Neuropsicocentro';
                        workbook.created = new Date();
                        workbook.modified = new Date();
                        headerStyle = {
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
                        titleStyle = {
                            font: { bold: true, size: 16, color: { argb: '2E86AB' } },
                            alignment: { vertical: 'middle', horizontal: 'center' }
                        };
                        worksheet = workbook.addWorksheet(this.getSheetName(reportType));
                        worksheet.mergeCells('A1:J1');
                        titleCell = worksheet.getCell('A1');
                        titleCell.value = "RELAT\u00D3RIO: ".concat(reportType.toUpperCase());
                        Object.assign(titleCell, titleStyle);
                        worksheet.mergeCells('A2:J2');
                        dateCell = worksheet.getCell('A2');
                        dateCell.value = "Gerado em: ".concat(new Date().toLocaleString('pt-BR'));
                        dateCell.font = { italic: true, color: { argb: '666666' } };
                        dateCell.alignment = { horizontal: 'center' };
                        worksheet.addRow([]);
                        startRow = 4;
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
                        worksheet.columns.forEach(function (column) {
                            if (column.values) {
                                var maxLength = Math.max.apply(Math, column.values.map(function (v) { return v ? v.toString().length : 0; }));
                                column.width = Math.min(Math.max(maxLength + 2, 10), 50);
                            }
                        });
                        worksheet.views = [
                            { state: 'frozen', ySplit: startRow - 1, xSplit: 0 }
                        ];
                        return [4 /*yield*/, workbook.xlsx.writeBuffer()];
                    case 1:
                        buffer = _a.sent();
                        return [2 /*return*/, buffer];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Erro ao gerar Excel, usando fallback:', error_1);
                        return [2 /*return*/, this.generateFallbackExcel(data, reportType)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ReportService.addProductsToExcel = function (worksheet, data, headerStyle, startRow) {
        var _this = this;
        if (!data.produtos || !Array.isArray(data.produtos) || data.produtos.length === 0) {
            worksheet.getCell("A".concat(startRow)).value = 'Nenhum produto cadastrado';
            return startRow + 2;
        }
        var headers = ['Código', 'Nome', 'Tipo', 'Categoria', 'Localização', 'Quantidade', 'Estoque Mínimo', 'Preço Unitário', 'Valor Total', 'Status'];
        var headerRow = worksheet.addRow(headers);
        headerRow.eachCell(function (cell) { return Object.assign(cell, headerStyle); });
        data.produtos.forEach(function (product) {
            var row = worksheet.addRow([
                product.codigo || 'N/A',
                product.nome || 'N/A',
                product.tipo || 'N/A',
                product.categoria || 'N/A',
                product.localizacao || 'N/A',
                product.quantidade || 0,
                product.estoque_minimo || 0,
                _this.formatCurrency(product.preco_unitario || 0),
                _this.formatCurrency(product.valor_total || 0),
                product.status || 'N/A'
            ]);
            if (product.status === 'SEM ESTOQUE') {
                row.eachCell(function (cell) {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E6' } };
                });
            }
            else if (product.status === 'ESTOQUE BAIXO') {
                row.eachCell(function (cell) {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4E6' } };
                });
            }
        });
        var summaryRow = startRow + data.produtos.length + 2;
        if (data.resumo) {
            worksheet.getCell("A".concat(summaryRow)).value = 'RESUMO';
            worksheet.getCell("A".concat(summaryRow)).font = { bold: true, size: 12 };
            worksheet.addRow(['Total de Produtos:', data.resumo.total_produtos]);
            worksheet.addRow(['Valor Total do Estoque:', this.formatCurrency(data.resumo.valor_total_estoque)]);
            worksheet.addRow(['Produtos com Estoque Baixo:', data.resumo.produtos_estoque_baixo]);
            worksheet.addRow(['Produtos sem Estoque:', data.resumo.produtos_sem_estoque]);
            worksheet.addRow(['Produtos Normais:', data.resumo.produtos_normais]);
        }
        return summaryRow + 8;
    };
    ReportService.addLowStockToExcel = function (worksheet, data, headerStyle, startRow) {
        var _this = this;
        if (!data.produtos || !Array.isArray(data.produtos) || data.produtos.length === 0) {
            worksheet.getCell("A".concat(startRow)).value = 'Nenhum produto com estoque baixo';
            return startRow + 2;
        }
        var headers = ['Código', 'Nome', 'Categoria', 'Quant. Atual', 'Estoque Mín.', 'Diferença', 'Preço Unit.', 'Valor em Risco', 'Urgência', 'Ação Recomendada'];
        var headerRow = worksheet.addRow(headers);
        headerRow.eachCell(function (cell) { return Object.assign(cell, headerStyle); });
        data.produtos.forEach(function (product) {
            var row = worksheet.addRow([
                product.codigo || 'N/A',
                product.nome || 'N/A',
                product.categoria || 'N/A',
                product.quantidade_atual || 0,
                product.estoque_minimo || 0,
                product.diferenca || 0,
                _this.formatCurrency(product.preco_unitario || 0),
                _this.formatCurrency(product.valor_em_risco || 0),
                product.urgencia || 'N/A',
                product.acao_recomendada || 'N/A'
            ]);
            if (product.urgencia === 'CRÍTICO') {
                row.eachCell(function (cell) {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E6' } };
                    cell.font = { bold: true, color: { argb: 'CC0000' } };
                });
            }
            else {
                row.eachCell(function (cell) {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4E6' } };
                });
            }
        });
        var summaryRow = startRow + data.produtos.length + 2;
        if (data.resumo) {
            worksheet.getCell("A".concat(summaryRow)).value = 'RESUMO';
            worksheet.getCell("A".concat(summaryRow)).font = { bold: true, size: 12 };
            worksheet.addRow(['Total Estoque Baixo:', data.resumo.total_estoque_baixo]);
            worksheet.addRow(['Produtos Críticos:', data.resumo.produtos_criticos]);
            worksheet.addRow(['Produtos em Alerta:', data.resumo.produtos_alerta]);
            worksheet.addRow(['Valor Total em Risco:', this.formatCurrency(data.resumo.valor_total_em_risco)]);
        }
        return summaryRow + 6;
    };
    ReportService.addFinancialToExcel = function (worksheet, data, headerStyle, startRow) {
        var _this = this;
        var _a;
        if (data.resumo) {
            worksheet.getCell("A".concat(startRow)).value = 'RESUMO FINANCEIRO';
            worksheet.getCell("A".concat(startRow)).font = { bold: true, size: 14 };
            startRow++;
            worksheet.addRow(['Valor Total do Estoque:', this.formatCurrency(data.resumo.valor_total_estoque)]);
            worksheet.addRow(['Total de Produtos:', data.resumo.total_produtos]);
            worksheet.addRow(['Valor Médio por Produto:', this.formatCurrency(data.resumo.valor_medio_produto)]);
            worksheet.addRow(['Investimento Total:', this.formatCurrency(data.resumo.investimento_total)]);
            startRow += 5;
        }
        if (data.valor_por_categoria && Array.isArray(data.valor_por_categoria)) {
            worksheet.getCell("A".concat(startRow)).value = 'VALOR POR CATEGORIA';
            worksheet.getCell("A".concat(startRow)).font = { bold: true, size: 12 };
            startRow++;
            var headers = ['Categoria', 'Quantidade de Produtos', 'Valor Total', 'Percentual'];
            var headerRow = worksheet.addRow(headers);
            headerRow.eachCell(function (cell) { return Object.assign(cell, headerStyle); });
            data.valor_por_categoria.forEach(function (categoria) {
                var _a;
                worksheet.addRow([
                    categoria.categoria,
                    categoria.quantidade_produtos,
                    _this.formatCurrency(categoria.valor_total),
                    "".concat(((_a = categoria.percentual) === null || _a === void 0 ? void 0 : _a.toFixed(2)) || 0, "%")
                ]);
            });
            startRow += data.valor_por_categoria.length + 3;
        }
        if (data.top_produtos && Array.isArray(data.top_produtos)) {
            worksheet.getCell("A".concat(startRow)).value = 'TOP 10 PRODUTOS MAIS VALIOSOS';
            worksheet.getCell("A".concat(startRow)).font = { bold: true, size: 12 };
            startRow++;
            var headers = ['Nome', 'Código', 'Categoria', 'Quantidade', 'Preço Unitário', 'Valor Total'];
            var headerRow = worksheet.addRow(headers);
            headerRow.eachCell(function (cell) { return Object.assign(cell, headerStyle); });
            data.top_produtos.forEach(function (produto) {
                worksheet.addRow([
                    produto.nome,
                    produto.codigo,
                    produto.categoria,
                    produto.quantidade,
                    _this.formatCurrency(produto.preco_unitario),
                    _this.formatCurrency(produto.valor_total)
                ]);
            });
        }
        return startRow + (((_a = data.top_produtos) === null || _a === void 0 ? void 0 : _a.length) || 0) + 3;
    };
    ReportService.addMovementsToExcel = function (worksheet, data, headerStyle, startRow) {
        var _a, _b;
        if (!data.movimentacoes || !Array.isArray(data.movimentacoes) || data.movimentacoes.length === 0) {
            worksheet.getCell("A".concat(startRow)).value = 'Nenhuma movimentação encontrada';
            return startRow + 2;
        }
        if (data.resumo) {
            worksheet.getCell("A".concat(startRow)).value = 'RESUMO DE MOVIMENTAÇÕES';
            worksheet.getCell("A".concat(startRow)).font = { bold: true, size: 12 };
            startRow++;
            worksheet.addRow(['Período:', "".concat((_a = data.periodo) === null || _a === void 0 ? void 0 : _a.inicio, " a ").concat((_b = data.periodo) === null || _b === void 0 ? void 0 : _b.fim)]);
            worksheet.addRow(['Total de Movimentações:', data.resumo.total_movimentacoes]);
            worksheet.addRow(['Entradas:', data.resumo.entradas]);
            worksheet.addRow(['Saídas:', data.resumo.saidas]);
            worksheet.addRow(['Ajustes:', data.resumo.ajustes]);
            worksheet.addRow(['Quantidade Total Entrada:', data.resumo.quantidade_total_entrada]);
            worksheet.addRow(['Quantidade Total Saída:', data.resumo.quantidade_total_saida]);
            worksheet.addRow(['Saldo:', data.resumo.saldo]);
            startRow += 9;
        }
        worksheet.getCell("A".concat(startRow)).value = 'DETALHES DAS MOVIMENTAÇÕES';
        worksheet.getCell("A".concat(startRow)).font = { bold: true, size: 12 };
        startRow++;
        var headers = ['Produto', 'Código', 'Tipo', 'Quantidade', 'Data', 'Hora', 'Observações'];
        var headerRow = worksheet.addRow(headers);
        headerRow.eachCell(function (cell) { return Object.assign(cell, headerStyle); });
        data.movimentacoes.forEach(function (mov) {
            var row = worksheet.addRow([
                mov.produto,
                mov.codigo_produto,
                mov.tipo,
                mov.quantidade,
                mov.data,
                mov.hora,
                mov.observacoes
            ]);
            if (mov.tipo === 'ENTRADA') {
                row.eachCell(function (cell) {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E8F5E8' } };
                });
            }
            else if (mov.tipo === 'SAÍDA') {
                row.eachCell(function (cell) {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E6' } };
                });
            }
        });
        return startRow + data.movimentacoes.length + 3;
    };
    ReportService.addInventoryToExcel = function (worksheet, data, headerStyle, startRow) {
        if (!data.inventarios || !Array.isArray(data.inventarios) || data.inventarios.length === 0) {
            worksheet.getCell("A".concat(startRow)).value = 'Nenhum inventário encontrado';
            return startRow + 2;
        }
        if (data.resumo) {
            worksheet.getCell("A".concat(startRow)).value = 'RESUMO DE INVENTÁRIOS';
            worksheet.getCell("A".concat(startRow)).font = { bold: true, size: 12 };
            startRow++;
            worksheet.addRow(['Total de Inventários:', data.resumo.total_inventarios]);
            worksheet.addRow(['Inventários Finalizados:', data.resumo.inventarios_finalizados]);
            worksheet.addRow(['Inventários em Andamento:', data.resumo.inventarios_andamento]);
            worksheet.addRow(['Precisão Geral:', data.resumo.precisao_geral]);
            startRow += 5;
        }
        worksheet.getCell("A".concat(startRow)).value = 'DETALHES DOS INVENTÁRIOS';
        worksheet.getCell("A".concat(startRow)).font = { bold: true, size: 12 };
        startRow++;
        var headers = ['Nome', 'Status', 'Data Início', 'Data Fim', 'Total Produtos', 'Produtos c/ Divergência', 'Precisão'];
        var headerRow = worksheet.addRow(headers);
        headerRow.eachCell(function (cell) { return Object.assign(cell, headerStyle); });
        data.inventarios.forEach(function (inv) {
            var row = worksheet.addRow([
                inv.nome,
                inv.status,
                inv.data_inicio,
                inv.data_fim,
                inv.total_produtos,
                inv.produtos_com_divergencia,
                inv.precisao
            ]);
            if (inv.status === 'FINALIZADO') {
                row.eachCell(function (cell) {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E8F5E8' } };
                });
            }
        });
        return startRow + data.inventarios.length + 3;
    };
    ReportService.addProductsByLocationToExcel = function (worksheet, data, headerStyle, startRow) {
        var _this = this;
        if (!data.produtos_por_local || !Array.isArray(data.produtos_por_local) || data.produtos_por_local.length === 0) {
            worksheet.getCell("A".concat(startRow)).value = 'Nenhum local com produtos encontrado';
            return startRow + 2;
        }
        if (data.resumo_geral) {
            worksheet.getCell("A".concat(startRow)).value = 'RESUMO GERAL';
            worksheet.getCell("A".concat(startRow)).font = { bold: true, size: 12 };
            startRow++;
            worksheet.addRow(['Total de Locais:', data.resumo_geral.total_locais]);
            worksheet.addRow(['Total de Produtos:', data.resumo_geral.total_produtos]);
            worksheet.addRow(['Valor Total do Estoque:', this.formatCurrency(data.resumo_geral.valor_total_estoque)]);
            worksheet.addRow(['Local Mais Valioso:', data.resumo_geral.local_mais_valioso]);
            worksheet.addRow(['Local com Mais Produtos:', data.resumo_geral.local_mais_produtos]);
            startRow += 6;
        }
        data.produtos_por_local.forEach(function (local) {
            worksheet.getCell("A".concat(startRow)).value = "LOCAL: ".concat(local.local);
            worksheet.getCell("A".concat(startRow)).font = { bold: true, size: 11 };
            startRow++;
            if (local.resumo) {
                worksheet.addRow(['Descrição:', local.descricao]);
                worksheet.addRow(['Total de Produtos:', local.resumo.total_produtos]);
                worksheet.addRow(['Quantidade Total:', local.resumo.quantidade_total]);
                worksheet.addRow(['Valor Total:', _this.formatCurrency(local.resumo.valor_total)]);
                worksheet.addRow(['Produtos com Estoque Baixo:', local.resumo.produtos_estoque_baixo]);
                startRow += 6;
            }
            if (local.produtos && Array.isArray(local.produtos) && local.produtos.length > 0) {
                var headers = ['Código', 'Nome', 'Categoria', 'Quantidade', 'Preço Unitário', 'Valor Total', 'Status'];
                var headerRow = worksheet.addRow(headers);
                headerRow.eachCell(function (cell) { return Object.assign(cell, headerStyle); });
                local.produtos.forEach(function (produto) {
                    var row = worksheet.addRow([
                        produto.codigo,
                        produto.nome,
                        produto.categoria,
                        produto.quantidade,
                        _this.formatCurrency(produto.preco_unitario),
                        _this.formatCurrency(produto.valor_total),
                        produto.status
                    ]);
                    if (produto.status === 'ESTOQUE BAIXO') {
                        row.eachCell(function (cell) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4E6' } };
                        });
                    }
                });
                startRow += local.produtos.length + 2;
            }
            worksheet.addRow([]);
            startRow++;
        });
        return startRow;
    };
    ReportService.generatePDFReport = function (data, reportType) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        try {
                            var doc_1 = new pdfkit_1.default({ margin: 50, size: 'A4', layout: 'portrait' });
                            var buffers_1 = [];
                            doc_1.on('data', buffers_1.push.bind(buffers_1));
                            doc_1.on('end', function () { return resolve(Buffer.concat(buffers_1)); });
                            doc_1.on('error', reject);
                            doc_1.fillColor('#2E86AB')
                                .fontSize(20)
                                .font('Helvetica-Bold')
                                .text('NEUROPSICOCENTRO', 50, 50, { align: 'center' });
                            doc_1.fillColor('#1E3A5F')
                                .fontSize(16)
                                .text(reportType.toUpperCase(), 50, 80, { align: 'center' });
                            doc_1.fillColor('#666666')
                                .fontSize(10)
                                .text("Gerado em: ".concat(new Date().toLocaleString('pt-BR')), 50, 110, { align: 'center' });
                            doc_1.moveTo(50, 130)
                                .lineTo(545, 130)
                                .strokeColor('#2E86AB')
                                .lineWidth(2)
                                .stroke();
                            var yPosition = 160;
                            switch (reportType) {
                                case 'Produtos':
                                    yPosition = _this.addProductsToPDF(doc_1, data, yPosition);
                                    break;
                                case 'Estoque Baixo':
                                    yPosition = _this.addLowStockToPDF(doc_1, data, yPosition);
                                    break;
                                case 'Valor Estoque':
                                    yPosition = _this.addFinancialToPDF(doc_1, data, yPosition);
                                    break;
                                case 'Movimentações':
                                    yPosition = _this.addMovementsToPDF(doc_1, data, yPosition);
                                    break;
                                case 'Inventários':
                                    yPosition = _this.addInventoryToPDF(doc_1, data, yPosition);
                                    break;
                                case 'Produtos por Local':
                                    yPosition = _this.addProductsByLocationToPDF(doc_1, data, yPosition);
                                    break;
                                default:
                                    yPosition = _this.addGenericToPDF(doc_1, data, yPosition);
                            }
                            var addFooter_1 = function (pageNumber) {
                                var pageHeight = doc_1.page.height;
                                doc_1.fillColor('#666666')
                                    .fontSize(8)
                                    .text("P\u00E1gina ".concat(pageNumber), 50, pageHeight - 30, { align: 'center' })
                                    .text('Sistema Neuropsicocentro - Controle de Estoque', 50, pageHeight - 20, { align: 'center' });
                            };
                            addFooter_1(1);
                            doc_1.on('pageAdded', function () {
                                addFooter_1(doc_1.page.number);
                            });
                            doc_1.end();
                        }
                        catch (error) {
                            reject(error);
                        }
                    })];
            });
        });
    };
    ReportService.addProductsToPDF = function (doc, data, yPosition) {
        var _this = this;
        if (!data.produtos || !Array.isArray(data.produtos) || data.produtos.length === 0) {
            doc.font('Helvetica').fontSize(12).text('Nenhum produto cadastrado', 50, yPosition);
            return yPosition + 30;
        }
        doc.font('Helvetica-Bold').fontSize(14).text('RESUMO', 50, yPosition);
        yPosition += 20;
        if (data.resumo) {
            doc.font('Helvetica').fontSize(10)
                .text("Total de Produtos: ".concat(data.resumo.total_produtos), 60, yPosition)
                .text("Valor Total do Estoque: R$ ".concat(this.formatCurrency(data.resumo.valor_total_estoque)), 250, yPosition);
            yPosition += 15;
            doc.text("Produtos com Estoque Baixo: ".concat(data.resumo.produtos_estoque_baixo), 60, yPosition)
                .text("Produtos sem Estoque: ".concat(data.resumo.produtos_sem_estoque), 250, yPosition);
            yPosition += 15;
            doc.text("Produtos Normais: ".concat(data.resumo.produtos_normais), 60, yPosition);
            yPosition += 25;
        }
        doc.font('Helvetica-Bold').fontSize(12).text('LISTA DE PRODUTOS', 50, yPosition);
        yPosition += 20;
        var startX = 50;
        var colWidths = [50, 120, 80, 60, 40, 50, 50];
        doc.fillColor('#2E86AB')
            .rect(startX, yPosition, 495, 20)
            .fill();
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
        data.produtos.forEach(function (product, index) {
            var _a;
            if (yPosition > 700) {
                doc.addPage();
                yPosition = 50;
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
            if (index % 2 === 0) {
                doc.fillColor('#F8F9FA')
                    .rect(startX, yPosition, 495, 15)
                    .fill();
            }
            var textColor = '#333333';
            if (product.status === 'SEM ESTOQUE') {
                doc.fillColor('#FFE6E6').rect(startX, yPosition, 495, 15).fill();
                textColor = '#CC0000';
            }
            else if (product.status === 'ESTOQUE BAIXO') {
                doc.fillColor('#FFF4E6').rect(startX, yPosition, 495, 15).fill();
                textColor = '#E67E22';
            }
            doc.fillColor(textColor)
                .fontSize(8)
                .text(product.codigo || 'N/A', startX + 5, yPosition + 4)
                .text(_this.truncateText(product.nome, 25), startX + colWidths[0], yPosition + 4)
                .text(_this.truncateText(product.categoria, 15), startX + colWidths[0] + colWidths[1], yPosition + 4)
                .text(_this.truncateText(product.localizacao, 12), startX + colWidths[0] + colWidths[1] + colWidths[2], yPosition + 4)
                .text(((_a = product.quantidade) === null || _a === void 0 ? void 0 : _a.toString()) || '0', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], yPosition + 4)
                .text("R$ ".concat(_this.formatCurrency(product.preco_unitario)), startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], yPosition + 4)
                .text(product.status || 'N/A', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5], yPosition + 4);
            yPosition += 18;
        });
        return yPosition + 20;
    };
    ReportService.addLowStockToPDF = function (doc, data, yPosition) {
        var _this = this;
        if (!data.produtos || !Array.isArray(data.produtos) || data.produtos.length === 0) {
            doc.font('Helvetica').fontSize(12).text('Nenhum produto com estoque baixo encontrado', 50, yPosition);
            return yPosition + 30;
        }
        doc.font('Helvetica-Bold').fontSize(14).text('RESUMO - ESTOQUE BAIXO', 50, yPosition);
        yPosition += 20;
        if (data.resumo) {
            doc.font('Helvetica').fontSize(10)
                .text("Total de Produtos com Estoque Baixo: ".concat(data.resumo.total_estoque_baixo), 60, yPosition)
                .text("Produtos Cr\u00EDticos (Sem Estoque): ".concat(data.resumo.produtos_criticos), 250, yPosition);
            yPosition += 15;
            doc.text("Produtos em Alerta: ".concat(data.resumo.produtos_alerta), 60, yPosition)
                .text("Valor Total em Risco: R$ ".concat(this.formatCurrency(data.resumo.valor_total_em_risco)), 250, yPosition);
            yPosition += 25;
        }
        doc.font('Helvetica-Bold').fontSize(12).text('PRODUTOS COM ESTOQUE BAIXO', 50, yPosition);
        yPosition += 20;
        var startX = 50;
        var colWidths = [50, 120, 80, 40, 40, 40, 60, 50, 50];
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
        data.produtos.forEach(function (product, index) {
            var _a, _b, _c;
            if (yPosition > 700) {
                doc.addPage();
                yPosition = 50;
            }
            if (product.urgencia === 'CRÍTICO') {
                doc.fillColor('#FFE6E6').rect(startX, yPosition, 495, 15).fill();
            }
            else {
                doc.fillColor('#FFF4E6').rect(startX, yPosition, 495, 15).fill();
            }
            var textColor = product.urgencia === 'CRÍTICO' ? '#CC0000' : '#E67E22';
            doc.fillColor(textColor)
                .fontSize(8)
                .text(product.codigo || 'N/A', startX + 5, yPosition + 4)
                .text(_this.truncateText(product.nome, 25), startX + colWidths[0], yPosition + 4)
                .text(_this.truncateText(product.categoria, 15), startX + colWidths[0] + colWidths[1], yPosition + 4)
                .text(((_a = product.quantidade_atual) === null || _a === void 0 ? void 0 : _a.toString()) || '0', startX + colWidths[0] + colWidths[1] + colWidths[2], yPosition + 4)
                .text(((_b = product.estoque_minimo) === null || _b === void 0 ? void 0 : _b.toString()) || '0', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], yPosition + 4)
                .text(((_c = product.diferenca) === null || _c === void 0 ? void 0 : _c.toString()) || '0', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], yPosition + 4)
                .text("R$ ".concat(_this.formatCurrency(product.preco_unitario)), startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5], yPosition + 4)
                .text(product.urgencia || 'N/A', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5] + colWidths[6], yPosition + 4);
            yPosition += 18;
        });
        return yPosition + 20;
    };
    ReportService.addFinancialToPDF = function (doc, data, yPosition) {
        var _this = this;
        doc.font('Helvetica-Bold').fontSize(14).text('RESUMO FINANCEIRO', 50, yPosition);
        yPosition += 20;
        if (data.resumo) {
            doc.font('Helvetica').fontSize(11)
                .text("Valor Total do Estoque: R$ ".concat(this.formatCurrency(data.resumo.valor_total_estoque)), 60, yPosition);
            yPosition += 15;
            doc.text("Total de Produtos: ".concat(data.resumo.total_produtos), 60, yPosition)
                .text("Valor M\u00E9dio por Produto: R$ ".concat(this.formatCurrency(data.resumo.valor_medio_produto)), 250, yPosition);
            yPosition += 15;
            doc.text("Investimento Total: R$ ".concat(this.formatCurrency(data.resumo.investimento_total)), 60, yPosition);
            yPosition += 25;
        }
        if (data.valor_por_categoria && Array.isArray(data.valor_por_categoria)) {
            doc.font('Helvetica-Bold').fontSize(12).text('VALOR POR CATEGORIA', 50, yPosition);
            yPosition += 20;
            data.valor_por_categoria.forEach(function (categoria) {
                var _a;
                doc.font('Helvetica').fontSize(10)
                    .text("".concat(categoria.categoria, ":"), 60, yPosition)
                    .text("R$ ".concat(_this.formatCurrency(categoria.valor_total)), 200, yPosition)
                    .text("(".concat(categoria.quantidade_produtos, " produtos - ").concat((_a = categoria.percentual) === null || _a === void 0 ? void 0 : _a.toFixed(1), "%)"), 300, yPosition);
                yPosition += 15;
            });
            yPosition += 10;
        }
        if (data.top_produtos && Array.isArray(data.top_produtos)) {
            doc.font('Helvetica-Bold').fontSize(12).text('TOP 10 PRODUTOS MAIS VALIOSOS', 50, yPosition);
            yPosition += 20;
            data.top_produtos.forEach(function (produto, index) {
                doc.font('Helvetica').fontSize(9)
                    .text("".concat(index + 1, ". ").concat(produto.nome), 60, yPosition)
                    .text("R$ ".concat(_this.formatCurrency(produto.valor_total)), 350, yPosition);
                yPosition += 12;
            });
        }
        return yPosition + 20;
    };
    ReportService.addMovementsToPDF = function (doc, data, yPosition) {
        var _a, _b;
        if (!data.movimentacoes || !Array.isArray(data.movimentacoes) || data.movimentacoes.length === 0) {
            doc.font('Helvetica').fontSize(12).text('Nenhuma movimentação encontrada', 50, yPosition);
            return yPosition + 30;
        }
        doc.font('Helvetica-Bold').fontSize(14).text('RESUMO DE MOVIMENTAÇÕES', 50, yPosition);
        yPosition += 20;
        if (data.resumo) {
            doc.font('Helvetica').fontSize(10)
                .text("Per\u00EDodo: ".concat((_a = data.periodo) === null || _a === void 0 ? void 0 : _a.inicio, " a ").concat((_b = data.periodo) === null || _b === void 0 ? void 0 : _b.fim), 60, yPosition);
            yPosition += 15;
            doc.text("Total de Movimenta\u00E7\u00F5es: ".concat(data.resumo.total_movimentacoes), 60, yPosition)
                .text("Entradas: ".concat(data.resumo.entradas), 200, yPosition)
                .text("Sa\u00EDdas: ".concat(data.resumo.saidas), 300, yPosition)
                .text("Ajustes: ".concat(data.resumo.ajustes), 400, yPosition);
            yPosition += 15;
            doc.text("Quantidade Total Entrada: ".concat(data.resumo.quantidade_total_entrada), 60, yPosition)
                .text("Quantidade Total Sa\u00EDda: ".concat(data.resumo.quantidade_total_saida), 250, yPosition)
                .text("Saldo: ".concat(data.resumo.saldo), 400, yPosition);
            yPosition += 25;
        }
        doc.font('Helvetica-Bold').fontSize(12).text('DETALHES DAS MOVIMENTAÇÕES', 50, yPosition);
        yPosition += 20;
        data.movimentacoes.forEach(function (mov, index) {
            if (yPosition > 700) {
                doc.addPage();
                yPosition = 50;
            }
            var bgColor = '#F8F9FA';
            var textColor = '#333333';
            if (mov.tipo === 'ENTRADA') {
                bgColor = '#E8F5E8';
                textColor = '#27AE60';
            }
            else if (mov.tipo === 'SAÍDA') {
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
                .text("Quantidade: ".concat(mov.quantidade), 320, yPosition + 5)
                .text(mov.data, 420, yPosition + 5)
                .text(mov.hora, 480, yPosition + 5);
            if (mov.observacoes && mov.observacoes !== 'Sem observações') {
                doc.fillColor('#666666')
                    .fontSize(8)
                    .text("Obs: ".concat(mov.observacoes), 55, yPosition + 15);
            }
            yPosition += 30;
        });
        return yPosition + 20;
    };
    ReportService.addInventoryToPDF = function (doc, data, yPosition) {
        if (!data.inventarios || !Array.isArray(data.inventarios) || data.inventarios.length === 0) {
            doc.font('Helvetica').fontSize(12).text('Nenhum inventário encontrado', 50, yPosition);
            return yPosition + 30;
        }
        doc.font('Helvetica-Bold').fontSize(14).text('RESUMO DE INVENTÁRIOS', 50, yPosition);
        yPosition += 20;
        if (data.resumo) {
            doc.font('Helvetica').fontSize(10)
                .text("Total de Invent\u00E1rios: ".concat(data.resumo.total_inventarios), 60, yPosition)
                .text("Invent\u00E1rios Finalizados: ".concat(data.resumo.inventarios_finalizados), 250, yPosition)
                .text("Invent\u00E1rios em Andamento: ".concat(data.resumo.inventarios_andamento), 400, yPosition);
            yPosition += 15;
            doc.text("Precis\u00E3o Geral: ".concat(data.resumo.precisao_geral), 60, yPosition);
            yPosition += 25;
        }
        doc.font('Helvetica-Bold').fontSize(12).text('DETALHES DOS INVENTÁRIOS', 50, yPosition);
        yPosition += 20;
        data.inventarios.forEach(function (inv, index) {
            if (yPosition > 700) {
                doc.addPage();
                yPosition = 50;
            }
            var bgColor = inv.status === 'FINALIZADO' ? '#E8F5E8' : '#FFF4E6';
            doc.fillColor(bgColor)
                .rect(50, yPosition, 495, 40)
                .fill();
            doc.fillColor('#333333')
                .fontSize(10)
                .text(inv.nome, 55, yPosition + 5)
                .text("Status: ".concat(inv.status), 300, yPosition + 5)
                .text("Precis\u00E3o: ".concat(inv.precisao), 420, yPosition + 5)
                .text("Data In\u00EDcio: ".concat(inv.data_inicio), 55, yPosition + 18)
                .text("Data Fim: ".concat(inv.data_fim), 200, yPosition + 18)
                .text("Total Produtos: ".concat(inv.total_produtos), 350, yPosition + 18)
                .text("Diverg\u00EAncias: ".concat(inv.produtos_com_divergencia), 450, yPosition + 18);
            yPosition += 45;
        });
        return yPosition + 20;
    };
    ReportService.addProductsByLocationToPDF = function (doc, data, yPosition) {
        var _this = this;
        if (!data.produtos_por_local || !Array.isArray(data.produtos_por_local) || data.produtos_por_local.length === 0) {
            doc.font('Helvetica').fontSize(12).text('Nenhum local com produtos encontrado', 50, yPosition);
            return yPosition + 30;
        }
        doc.font('Helvetica-Bold').fontSize(14).text('RESUMO GERAL', 50, yPosition);
        yPosition += 20;
        if (data.resumo_geral) {
            doc.font('Helvetica').fontSize(10)
                .text("Total de Locais: ".concat(data.resumo_geral.total_locais), 60, yPosition)
                .text("Total de Produtos: ".concat(data.resumo_geral.total_produtos), 250, yPosition)
                .text("Valor Total: R$ ".concat(this.formatCurrency(data.resumo_geral.valor_total_estoque)), 400, yPosition);
            yPosition += 15;
            doc.text("Local Mais Valioso: ".concat(data.resumo_geral.local_mais_valioso), 60, yPosition)
                .text("Local com Mais Produtos: ".concat(data.resumo_geral.local_mais_produtos), 300, yPosition);
            yPosition += 25;
        }
        data.produtos_por_local.forEach(function (local) {
            if (yPosition > 650) {
                doc.addPage();
                yPosition = 50;
            }
            doc.font('Helvetica-Bold').fontSize(12).text("LOCAL: ".concat(local.local), 50, yPosition);
            yPosition += 15;
            doc.font('Helvetica').fontSize(10).text("Descri\u00E7\u00E3o: ".concat(local.descricao), 60, yPosition);
            yPosition += 15;
            if (local.resumo) {
                doc.text("Total de Produtos: ".concat(local.resumo.total_produtos), 60, yPosition)
                    .text("Quantidade Total: ".concat(local.resumo.quantidade_total), 200, yPosition)
                    .text("Valor Total: R$ ".concat(_this.formatCurrency(local.resumo.valor_total)), 350, yPosition)
                    .text("Estoque Baixo: ".concat(local.resumo.produtos_estoque_baixo), 480, yPosition);
                yPosition += 20;
            }
            if (local.produtos && Array.isArray(local.produtos)) {
                if (local.produtos.length <= 10) {
                    local.produtos.forEach(function (produto) {
                        if (yPosition > 700) {
                            doc.addPage();
                            yPosition = 50;
                        }
                        doc.font('Helvetica').fontSize(8)
                            .text("\u2022 ".concat(produto.nome), 70, yPosition)
                            .text("Quant: ".concat(produto.quantidade), 250, yPosition)
                            .text("Pre\u00E7o: R$ ".concat(_this.formatCurrency(produto.preco_unitario)), 320, yPosition)
                            .text("Status: ".concat(produto.status), 420, yPosition);
                        yPosition += 12;
                    });
                }
                else {
                    doc.font('Helvetica').fontSize(9).text("... ".concat(local.produtos.length, " produtos neste local"), 70, yPosition);
                    yPosition += 15;
                }
            }
            yPosition += 15;
        });
        return yPosition + 20;
    };
    ReportService.addGenericDataToExcel = function (worksheet, data, headerStyle, startRow) {
        if (typeof data === 'object') {
            var headers = Object.keys(data);
            var headerRow = worksheet.addRow(headers);
            headerRow.eachCell(function (cell) { return Object.assign(cell, headerStyle); });
            var values = Object.values(data).map(function (v) {
                return typeof v === 'object' ? JSON.stringify(v) : String(v);
            });
            worksheet.addRow(values);
        }
        else {
            worksheet.getCell("A".concat(startRow)).value = 'Dados não disponíveis';
        }
        return startRow + 3;
    };
    ReportService.addGenericToPDF = function (doc, data, yPosition) {
        var _this = this;
        doc.font('Helvetica').fontSize(12).text('Relatório Genérico', 50, yPosition);
        if (data && typeof data === 'object') {
            Object.entries(data).forEach(function (_a) {
                var key = _a[0], value = _a[1];
                yPosition += 15;
                var text = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
                doc.text("".concat(key, ": ").concat(_this.truncateText(text, 100)), 50, yPosition);
            });
        }
        return yPosition + 30;
    };
    ReportService.generateFallbackExcel = function (data, reportType) {
        return __awaiter(this, void 0, void 0, function () {
            var workbook, worksheet, row_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        workbook = new exceljs_1.default.Workbook();
                        worksheet = workbook.addWorksheet('Relatório');
                        worksheet.getCell('A1').value = "RELAT\u00D3RIO: ".concat(reportType);
                        worksheet.getCell('A2').value = "Gerado em: ".concat(new Date().toLocaleString('pt-BR'));
                        if (data && typeof data === 'object') {
                            row_1 = 4;
                            Object.entries(data).forEach(function (_a) {
                                var key = _a[0], value = _a[1];
                                worksheet.getCell("A".concat(row_1)).value = key;
                                if (typeof value === 'object') {
                                    worksheet.getCell("B".concat(row_1)).value = JSON.stringify(value);
                                }
                                else {
                                    worksheet.getCell("B".concat(row_1)).value = String(value);
                                }
                                row_1++;
                            });
                        }
                        else {
                            worksheet.getCell('A4').value = 'Nenhum dado disponível';
                        }
                        return [4 /*yield*/, workbook.xlsx.writeBuffer()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ReportService.formatCurrency = function (value) {
        var num = typeof value === 'string' ? parseFloat(value) : Number(value);
        return isNaN(num) ? '0.00' : num.toFixed(2);
    };
    ReportService.truncateText = function (text, maxLength) {
        if (!text)
            return 'N/A';
        return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
    };
    ReportService.getSheetName = function (reportType) {
        var names = {
            'Produtos': 'Produtos',
            'Estoque Baixo': 'Estoque_Baixo',
            'Valor Estoque': 'Valor_Estoque',
            'Movimentações': 'Movimentacoes',
            'Inventários': 'Inventarios',
            'Produtos por Local': 'Produtos_por_Local'
        };
        return names[reportType] || 'Relatorio';
    };
    return ReportService;
}());
exports.ReportService = ReportService;
exports.default = ReportService;
