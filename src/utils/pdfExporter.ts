import jsPDF from 'jspdf';
import type { BOMResult } from './bomCalculator';
import type { NestingResult } from './nestingAlgorithm';

export interface ProjectData {
  dimensions: {
    comprimento: number;
    largura: number;
    altura: number;
  };
  sheet: {
    name: string;
    width: number;
    height: number;
  };
  bom: BOMResult;
  nesting: NestingResult;
  custo?: {
    materialTotal: number;
    precoVenda: number;
    margemLucro: number;
  };
}

export function exportToPDF(project: ProjectData) {
  const doc = new jsPDF();
  let y = 20;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('RELATÓRIO DE NESTING INDUSTRIAL', 105, y, { align: 'center' });
  
  y += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Mesa Inox - Especificação Técnica', 105, y, { align: 'center' });
  
  y += 15;
  doc.setDrawColor(66, 139, 202);
  doc.line(20, y, 190, y);
  y += 10;

  // Dimensões da Mesa
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DIMENSÕES DA MESA', 20, y);
  y += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Comprimento: ${project.dimensions.comprimento} mm`, 25, y);
  y += 6;
  doc.text(`Largura: ${project.dimensions.largura} mm`, 25, y);
  y += 6;
  doc.text(`Altura: ${project.dimensions.altura} mm`, 25, y);
  y += 10;

  // Chapa Selecionada
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CHAPA SELECIONADA', 20, y);
  y += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Dimensões: ${project.sheet.name} mm`, 25, y);
  y += 6;
  doc.text(`Eficiência: ${project.nesting.efficiency.toFixed(2)}%`, 25, y);
  y += 6;
  doc.text(`Desperdício: ${(100 - project.nesting.efficiency).toFixed(2)}%`, 25, y);
  y += 10;

  // BOM - Bill of Materials
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL OF MATERIALS (BOM)', 20, y);
  y += 8;

  // Table header
  doc.setFillColor(240, 240, 240);
  doc.rect(20, y - 5, 170, 7, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Descrição', 22, y);
  doc.text('Qtd', 95, y);
  doc.text('Largura (mm)', 115, y);
  doc.text('Altura (mm)', 150, y);
  y += 7;

  // Table rows
  doc.setFont('helvetica', 'normal');
  project.bom.bom.forEach((item) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(item.desc, 22, y);
    doc.text(item.qtd.toString(), 95, y);
    doc.text(item.w.toFixed(1), 115, y);
    doc.text(item.h.toFixed(1), 150, y);
    y += 6;
  });

  y += 5;

  // Pés
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PÉST (TUBOS)', 20, y);
  y += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Quantidade: ${project.bom.pes.qtd} unidades`, 25, y);
  y += 6;
  doc.text(`Comprimento do tubo: ${project.bom.pes.tubo.toFixed(1)} mm`, 25, y);
  y += 10;

  // Contraventamentos
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('CONTRAVENTAMENTOS', 20, y);
  y += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Lateral: ${project.bom.contraventamentos.lateral.toFixed(1)} mm`, 25, y);
  y += 6;
  doc.text(`Traseiro: ${project.bom.contraventamentos.traseiro.toFixed(1)} mm`, 25, y);
  y += 10;

  // Custos (se disponível)
  if (project.custo) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ANÁLISE DE CUSTOS', 20, y);
    y += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Custo de Material: R$ ${project.custo.materialTotal.toFixed(2)}`, 25, y);
    y += 6;
    doc.text(`Preço de Venda: R$ ${project.custo.precoVenda.toFixed(2)}`, 25, y);
    y += 6;
    doc.text(`Margem de Lucro: ${project.custo.margemLucro.toFixed(1)}%`, 25, y);
    y += 10;
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
      20,
      285
    );
    doc.text(`Página ${i} de ${pageCount}`, 190, 285, { align: 'right' });
  }

  // Save PDF
  const fileName = `Mesa_Inox_${project.dimensions.comprimento}x${project.dimensions.largura}x${project.dimensions.altura}_${new Date().getTime()}.pdf`;
  doc.save(fileName);
}

export function exportToCSV(bom: BOMResult) {
  const headers = ['Descrição', 'Quantidade', 'Largura (mm)', 'Altura (mm)', 'Área Total (mm²)'];
  const rows = bom.bom.map((item) => [
    item.desc,
    item.qtd.toString(),
    item.w.toFixed(1),
    item.h.toFixed(1),
    (item.w * item.h * item.qtd).toFixed(0),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
    '',
    'PÉST',
    `Quantidade,${bom.pes.qtd}`,
    `Comprimento do tubo (mm),${bom.pes.tubo.toFixed(1)}`,
    '',
    'CONTRAVENTAMENTOS',
    `Lateral (mm),${bom.contraventamentos.lateral.toFixed(1)}`,
    `Traseiro (mm),${bom.contraventamentos.traseiro.toFixed(1)}`,
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `BOM_Mesa_Inox_${new Date().getTime()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
