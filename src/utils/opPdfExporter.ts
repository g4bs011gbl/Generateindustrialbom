import jsPDF from 'jspdf';
import 'jspdf-autotable';
import JsBarcode from 'jsbarcode';
import type { OrdemProducao } from './ordemProducao';

// Tipos para jspdf-autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

// Configuração do logo (será substituído pelo logo customizado)
let logoDataUrl: string | null = null;

export function setLogoEmpresa(dataUrl: string) {
  logoDataUrl = dataUrl;
  localStorage.setItem('logoEmpresa', dataUrl);
}

export function getLogoEmpresa(): string | null {
  if (logoDataUrl) return logoDataUrl;
  return localStorage.getItem('logoEmpresa');
}

// Gerar código de barras
function gerarBarcode(texto: string): string {
  const canvas = document.createElement('canvas');
  JsBarcode(canvas, texto, {
    format: 'CODE128',
    displayValue: true,
    fontSize: 12,
    height: 40,
    width: 2
  });
  return canvas.toDataURL('image/png');
}

export function exportOPToPDF(op: OrdemProducao) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;

  // ========== CABEÇALHO ==========
  
  // Logo (se existir)
  const logo = getLogoEmpresa();
  if (logo) {
    doc.addImage(logo, 'PNG', margin, margin, 50, 20);
  } else {
    // Placeholder para logo
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, margin, 50, 20, 'F');
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('LOGO', margin + 25, margin + 12, { align: 'center' });
  }

  // Título ORDEM DE PRODUÇÃO
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('ORDEM DE PRODUÇÃO', pageWidth / 2, margin + 15, { align: 'center' });

  // Número da OP (canto superior direito)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nº da Ordem de produ.`, pageWidth - margin - 45, margin + 5);
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(op.numeroOP, pageWidth - margin - 22, margin + 13, { align: 'center' });

  // Código de barras
  const barcodeImg = gerarBarcode(op.numeroOP);
  doc.addImage(barcodeImg, 'PNG', pageWidth - margin - 50, margin + 16, 40, 15);

  let yPos = margin + 35;

  // ========== DESCRIÇÃO DO PRODUTO ==========
  doc.setFillColor(230, 230, 230);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Descrição do produto', margin + 2, yPos + 5);

  yPos += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const descLines = doc.splitTextToSize(op.descricaoProduto, pageWidth - 2 * margin - 4);
  doc.text(descLines, margin + 2, yPos);
  yPos += descLines.length * 5 + 3;

  // ========== INFORMAÇÕES PRINCIPAIS ==========
  doc.autoTable({
    startY: yPos,
    margin: { left: margin, right: margin },
    head: [['Código do Produto', 'N.S.', 'Liberação OP', 'Prazo', 'Qtde', '']],
    body: [[
      op.codigoProduto,
      '',
      new Date(op.dataEmissao).toLocaleDateString('pt-BR'),
      new Date(op.prazo).toLocaleDateString('pt-BR'),
      op.qtde,
      op.unidade
    ]],
    theme: 'grid',
    headStyles: { fillColor: [200, 200, 200], textColor: 0, fontSize: 8 },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 25 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30 },
      4: { cellWidth: 20 },
      5: { cellWidth: 15 }
    }
  });

  yPos = doc.lastAutoTable.finalY + 3;

  // Nº do pedido
  doc.autoTable({
    startY: yPos,
    margin: { left: margin, right: margin },
    body: [[`Nº do pedido:`, op.numeroPedido || '-', `Emissão do pedido:`, new Date(op.dataEmissao).toLocaleDateString('pt-BR')]],
    theme: 'grid',
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 30, fontStyle: 'bold' },
      1: { cellWidth: 50 },
      2: { cellWidth: 40, fontStyle: 'bold' },
      3: { cellWidth: 40 }
    }
  });

  yPos = doc.lastAutoTable.finalY + 3;

  // Cliente
  doc.autoTable({
    startY: yPos,
    margin: { left: margin, right: margin },
    body: [[`Cliente:`, op.cliente.nome]],
    theme: 'grid',
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 30, fontStyle: 'bold' },
      1: { cellWidth: 130 }
    }
  });

  yPos = doc.lastAutoTable.finalY + 3;

  // Inform. Adicion
  doc.autoTable({
    startY: yPos,
    margin: { left: margin, right: margin },
    body: [[`Inform. Adicion:`, 'ITEM 01']],
    theme: 'grid',
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 30, fontStyle: 'bold' },
      1: { cellWidth: 130 }
    }
  });

  yPos = doc.lastAutoTable.finalY + 5;

  // ========== OBSERVAÇÃO E INFORMAÇÃO COMPLEMENTAR ==========
  const obsHeight = 15;
  doc.setFillColor(230, 230, 230);
  doc.rect(margin, yPos, (pageWidth - 2 * margin) * 0.6, 7, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Observação:', margin + 2, yPos + 5);

  doc.setFillColor(230, 230, 230);
  doc.rect(margin + (pageWidth - 2 * margin) * 0.6 + 2, yPos, (pageWidth - 2 * margin) * 0.4 - 2, 7, 'F');
  doc.text('Informação complementar do item', margin + (pageWidth - 2 * margin) * 0.6 + 4, yPos + 5);

  // Bordas das áreas
  doc.setDrawColor(0);
  doc.rect(margin, yPos, (pageWidth - 2 * margin) * 0.6, obsHeight + 7);
  doc.rect(margin + (pageWidth - 2 * margin) * 0.6 + 2, yPos, (pageWidth - 2 * margin) * 0.4 - 2, obsHeight + 7);

  yPos += obsHeight + 10;

  // ========== PROCESSOS ==========
  doc.autoTable({
    startY: yPos,
    margin: { left: margin, right: margin },
    head: [['', 'PROCESSO', 'INÍCIO', 'TÉRMINO', 'OBS', 'RESPONSÁVEL', 'LÍDER']],
    body: op.processos.map(p => [
      p.ordem,
      p.nome,
      p.inicio || '',
      p.termino || '',
      p.observacoes || '',
      p.responsavel || '',
      p.lider || ''
    ]),
    theme: 'grid',
    headStyles: { fillColor: [200, 200, 200], textColor: 0, fontSize: 8, halign: 'center' },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 30 },
      2: { cellWidth: 22 },
      3: { cellWidth: 22 },
      4: { cellWidth: 30 },
      5: { cellWidth: 28 },
      6: { cellWidth: 20 }
    }
  });

  yPos = doc.lastAutoTable.finalY + 5;

  // ========== CONTROLE DE REVISÃO DE PRAZO ==========
  doc.autoTable({
    startY: yPos,
    margin: { left: margin, right: margin },
    head: [['CONTROLE DE REVISÃO DE PRAZO O.P.']],
    headStyles: { fillColor: [255, 255, 255], textColor: 0, fontSize: 9, fontStyle: 'bold', halign: 'center' },
    theme: 'plain'
  });

  yPos = doc.lastAutoTable.finalY + 2;

  doc.autoTable({
    startY: yPos,
    margin: { left: margin, right: margin },
    head: [['REVISÃO', 'DATA', 'NOVO PRAZO', 'MOTIVO / JUSTIFICATIVA']],
    body: [
      ['1', '', '', ''],
      ['2', '', '', '']
    ],
    theme: 'grid',
    headStyles: { fillColor: [200, 200, 200], textColor: 0, fontSize: 8, halign: 'center' },
    bodyStyles: { fontSize: 8, minCellHeight: 8 },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' },
      1: { cellWidth: 30 },
      2: { cellWidth: 30 },
      3: { cellWidth: 80 }
    }
  });

  yPos = doc.lastAutoTable.finalY + 5;

  // ========== OBSERVAÇÃO FINAL ==========
  doc.autoTable({
    startY: yPos,
    margin: { left: margin, right: margin },
    head: [['OBSERVAÇÃO']],
    body: Array(7).fill(['']),
    theme: 'grid',
    headStyles: { fillColor: [255, 255, 255], textColor: 0, fontSize: 9, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, minCellHeight: 7 }
  });

  // Rodapé
  doc.setFontSize(7);
  doc.setTextColor(100);
  doc.text(
    `Qua, 4 fev 2026 08:53:53 - FR-026 - REV 18 - Página 1 de 1`,
    margin,
    pageHeight - 5
  );

  // Salvar PDF
  doc.save(`OP_${op.numeroOP}_${op.cliente.nome}.pdf`);
}

// Exportar múltiplas OPs em lote
export function exportMultiplasOPsToPDF(ops: OrdemProducao[]) {
  ops.forEach((op, index) => {
    setTimeout(() => {
      exportOPToPDF(op);
    }, index * 500); // Delay para não sobrecarregar
  });
}
