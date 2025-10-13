// server/utils/reportGenerator.ts
import { Product, Movement, Inventory, InventoryCount } from "@shared/schema";

export interface ReportData {
  title: string;
  generatedAt: string;
  summary: any;
  data: any[];
}

export class ReportGenerator {
  static generateProductsReport(products: Product[]): ReportData {
    const totalValue = products.reduce((sum, product) => {
      const price = parseFloat(product.unitPrice?.toString() || '0');
      return sum + (price * product.quantity);
    }, 0);

    return {
      title: "Relatório de Produtos",
      generatedAt: new Date().toISOString(),
      summary: {
        totalProducts: products.length,
        totalValue: totalValue,
        lowStockCount: products.filter(p => p.quantity <= p.minQuantity).length,
        outOfStockCount: products.filter(p => p.quantity === 0).length
      },
      data: products.map(product => ({
        código: product.code,
        nome: product.name,
        tipo: product.type,
        categoria: product.categoryId,
        quantidade: product.quantity,
        estoque_mínimo: product.minQuantity,
        preço_unitário: parseFloat(product.unitPrice?.toString() || '0'),
        valor_total: parseFloat(product.unitPrice?.toString() || '0') * product.quantity,
        localização: product.locationId,
        status: product.quantity === 0 ? 'SEM ESTOQUE' : 
                product.quantity <= product.minQuantity ? 'ESTOQUE BAIXO' : 'NORMAL'
      }))
    };
  }

  static generateLowStockReport(products: Product[]): ReportData {
    const lowStockProducts = products.filter(p => p.quantity <= p.minQuantity);
    const criticalProducts = lowStockProducts.filter(p => p.quantity === 0);
    const warningProducts = lowStockProducts.filter(p => p.quantity > 0 && p.quantity <= p.minQuantity);
    
    const totalValueAtRisk = lowStockProducts.reduce((sum, product) => {
      const price = parseFloat(product.unitPrice?.toString() || '0');
      return sum + (price * product.quantity);
    }, 0);

    return {
      title: "Relatório de Estoque Baixo",
      generatedAt: new Date().toISOString(),
      summary: {
        totalLowStock: lowStockProducts.length,
        criticalProducts: criticalProducts.length,
        warningProducts: warningProducts.length,
        totalValueAtRisk: totalValueAtRisk
      },
      data: lowStockProducts.map(product => ({
        código: product.code,
        nome: product.name,
        tipo: product.type,
        quantidade_atual: product.quantity,
        estoque_mínimo: product.minQuantity,
        diferença: product.minQuantity - product.quantity,
        preço_unitário: parseFloat(product.unitPrice?.toString() || '0'),
        valor_em_risco: parseFloat(product.unitPrice?.toString() || '0') * (product.minQuantity - product.quantity),
        urgência: product.quantity === 0 ? 'CRÍTICO' : 'ALERTA',
        ação_recomendada: product.quantity === 0 ? 'URGENTE: Repor estoque' : 'Monitorar e repor'
      })).sort((a, b) => a.urgência.localeCompare(b.urgência))
    };
  }

  static generateFinancialReport(products: Product[]): ReportData {
    const totalValue = products.reduce((sum, product) => {
      const price = parseFloat(product.unitPrice?.toString() || '0');
      return sum + (price * product.quantity);
    }, 0);

    const valueByType = products.reduce((acc, product) => {
      const price = parseFloat(product.unitPrice?.toString() || '0');
      const value = price * product.quantity;
      const type = product.type || 'Sem Tipo';
      
      if (!acc[type]) {
        acc[type] = { totalValue: 0, productCount: 0 };
      }
      
      acc[type].totalValue += value;
      acc[type].productCount += 1;
      
      return acc;
    }, {} as Record<string, { totalValue: number; productCount: number }>);

    // Top 10 produtos mais valiosos
    const topProducts = products
      .map(product => ({
        nome: product.name,
        código: product.code,
        tipo: product.type,
        valor_total: parseFloat(product.unitPrice?.toString() || '0') * product.quantity,
        quantidade: product.quantity,
        preço_unitário: parseFloat(product.unitPrice?.toString() || '0')
      }))
      .sort((a, b) => b.valor_total - a.valor_total)
      .slice(0, 10);

    return {
      title: "Relatório Financeiro do Estoque",
      generatedAt: new Date().toISOString(),
      summary: {
        valor_total_estoque: totalValue,
        total_produtos: products.length,
        valor_médio_por_produto: products.length > 0 ? totalValue / products.length : 0,
        investimento_total: totalValue
      },
      data: Object.entries(valueByType).map(([type, data]) => ({
        categoria: type,
        valor_total: data.totalValue,
        quantidade_produtos: data.productCount,
        percentual: (data.totalValue / totalValue) * 100,
        valor_médio: data.totalValue / data.productCount
      })).concat([{
        categoria: 'TOTAL GERAL',
        valor_total: totalValue,
        quantidade_produtos: products.length,
        percentual: 100,
        valor_médio: totalValue / products.length
      }])
    };
  }

  static generateMovementsReport(movements: Movement[], startDate?: Date, endDate?: Date): ReportData {
    const filteredMovements = movements.filter(movement => {
      if (!startDate && !endDate) return true;
      
      const movementDate = new Date(movement.createdAt);
      const matchesStart = !startDate || movementDate >= startDate;
      const matchesEnd = !endDate || movementDate <= endDate;
      
      return matchesStart && matchesEnd;
    });

    const entradaMovements = filteredMovements.filter(m => m.type === 'entrada');
    const saidaMovements = filteredMovements.filter(m => m.type === 'saida');
    const ajusteMovements = filteredMovements.filter(m => m.type === 'ajuste');

    const totalEntrada = entradaMovements.reduce((sum, m) => sum + m.quantity, 0);
    const totalSaida = saidaMovements.reduce((sum, m) => sum + m.quantity, 0);

    return {
      title: "Relatório de Movimentações",
      generatedAt: new Date().toISOString(),
      summary: {
        período: {
          início: startDate?.toISOString().split('T')[0] || 'Todo o período',
          fim: endDate?.toISOString().split('T')[0] || 'Todo o período'
        },
        total_movimentações: filteredMovements.length,
        entradas: entradaMovements.length,
        saídas: saidaMovements.length,
        ajustes: ajusteMovements.length,
        quantidade_total_entrada: totalEntrada,
        quantidade_total_saída: totalSaida,
        saldo: totalEntrada - totalSaida,
        taxa_rotatividade: totalSaida > 0 ? (totalEntrada / totalSaida).toFixed(2) : 'N/A'
      },
      data: filteredMovements.map(movement => ({
        id: movement.id,
        tipo: this.getMovementTypeLabel(movement.type),
        quantidade: movement.quantity,
        produto_id: movement.productId,
        data: new Date(movement.createdAt).toLocaleDateString('pt-BR'),
        hora: new Date(movement.createdAt).toLocaleTimeString('pt-BR'),
        observações: movement.notes || '-',
        usuário: movement.userId
      })).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    };
  }

  static generateInventoryReport(inventories: Inventory[], inventoryCounts: InventoryCount[]): ReportData {
    const inventorySummaries = inventories.map(inventory => {
      const counts = inventoryCounts.filter(count => count.inventoryId === inventory.id);
      const totalDifferences = counts.reduce((sum, count) => sum + Math.abs(count.difference), 0);
      const totalProducts = counts.length;
      const accurateCounts = counts.filter(count => count.difference === 0).length;
      
      return {
        inventário: inventory.name,
        status: inventory.status === 'finalizado' ? 'FINALIZADO' : 'EM ANDAMENTO',
        data_início: new Date(inventory.createdAt).toLocaleDateString('pt-BR'),
        data_fim: inventory.finishedAt ? new Date(inventory.finishedAt).toLocaleDateString('pt-BR') : '-',
        total_produtos: totalProducts,
        produtos_com_divergência: counts.filter(count => count.difference !== 0).length,
        precisão: totalProducts > 0 ? ((accurateCounts / totalProducts) * 100).toFixed(2) + '%' : '100%',
        diferença_total: totalDifferences,
        responsável: inventory.userId
      };
    });

    const overallAccuracy = inventorySummaries.reduce((sum, inv) => {
      const accuracy = parseFloat(inv.precisão) || 0;
      return sum + accuracy;
    }, 0) / inventorySummaries.length;

    return {
      title: "Relatório de Inventários",
      generatedAt: new Date().toISOString(),
      summary: {
        total_inventários: inventories.length,
        inventários_finalizados: inventories.filter(i => i.status === 'finalizado').length,
        inventários_andamento: inventories.filter(i => i.status === 'em_andamento').length,
        precisão_geral: overallAccuracy.toFixed(2) + '%',
        produto_mais_contado: this.getMostCountedProduct(inventoryCounts),
        maior_divergência: this.getLargestDifference(inventoryCounts)
      },
      data: inventorySummaries
    };
  }

  static generateProductsByLocationReport(products: Product[], locations: any[]): ReportData {
    const productsByLocation = locations.map(location => {
      const locationProducts = products.filter(product => product.locationId === location.id);
      const totalValue = locationProducts.reduce((sum, product) => {
        const price = parseFloat(product.unitPrice?.toString() || '0');
        return sum + (price * product.quantity);
      }, 0);
      
      const totalQuantity = locationProducts.reduce((sum, product) => sum + product.quantity, 0);
      
      return {
        local: location.name,
        descrição: location.description || '-',
        total_produtos: locationProducts.length,
        quantidade_total: totalQuantity,
        valor_total: totalValue,
        produtos_estoque_baixo: locationProducts.filter(p => p.quantity <= p.minQuantity).length,
        valor_médio_por_produto: locationProducts.length > 0 ? totalValue / locationProducts.length : 0
      };
    });

    const overallTotalValue = productsByLocation.reduce((sum, loc) => sum + loc.valor_total, 0);
    const overallTotalProducts = productsByLocation.reduce((sum, loc) => sum + loc.total_produtos, 0);

    return {
      title: "Relatório de Produtos por Local",
      generatedAt: new Date().toISOString(),
      summary: {
        total_locais: locations.length,
        valor_total_estoque: overallTotalValue,
        total_produtos: overallTotalProducts,
        local_mais_valioso: productsByLocation.sort((a, b) => b.valor_total - a.valor_total)[0]?.local || 'N/A',
        local_mais_produtos: productsByLocation.sort((a, b) => b.total_produtos - a.total_produtos)[0]?.local || 'N/A'
      },
      data: productsByLocation.sort((a, b) => b.valor_total - a.valor_total)
    };
  }

  private static getMovementTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'entrada': 'ENTRADA',
      'saida': 'SAÍDA', 
      'ajuste': 'AJUSTE'
    };
    return labels[type] || type.toUpperCase();
  }

  private static getMostCountedProduct(counts: InventoryCount[]): string {
    if (counts.length === 0) return 'N/A';
    
    const productCount = counts.reduce((acc, count) => {
      acc[count.productId] = (acc[count.productId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCounted = Object.entries(productCount).sort((a, b) => b[1] - a[1])[0];
    return `Produto ${mostCounted[0]} (${mostCounted[1]} vezes)`;
  }

  private static getLargestDifference(counts: InventoryCount[]): string {
    if (counts.length === 0) return 'N/A';
    
    const largestDiff = counts.reduce((max, count) => 
      Math.abs(count.difference) > Math.abs(max.difference) ? count : max
    );
    
    return `Diferença de ${largestDiff.difference} unidades (Produto ${largestDiff.productId})`;
  }
}

export default ReportGenerator;