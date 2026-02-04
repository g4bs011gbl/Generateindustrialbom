import type { BOMResult } from './bomCalculator';
import type { Cliente } from './clienteStorage';

export interface OrdemProducao {
  id: string;
  numeroOP: string;
  cliente: Cliente;
  codigoProduto: string;
  descricaoProduto: string;
  numeroPedido: string;
  dataEmissao: string;
  prazo: string;
  qtde: number;
  unidade: string;
  bom: BOMResult;
  observacoes: string;
  processos: ProcessoOP[];
  revisoes: Revisao[];
  informacoesAdicionais?: string;
}

export interface ProcessoOP {
  ordem: number;
  nome: string;
  inicio?: string;
  termino?: string;
  observacoes?: string;
  responsavel?: string;
  lider?: string;
}

export interface Revisao {
  numero: number;
  data: string;
  novoPrazo: string;
  motivo: string;
}

const STORAGE_KEY = 'ordensProducao';
const COUNTER_KEY = 'opCounter';

export function gerarNumeroOP(): string {
  const counter = parseInt(localStorage.getItem(COUNTER_KEY) || '0') + 1;
  localStorage.setItem(COUNTER_KEY, counter.toString());
  
  // Formato: XXXXX-YY (número sequencial - ano)
  const ano = new Date().getFullYear().toString().slice(-2);
  return `${counter.toString().padStart(5, '0')}-${ano}`;
}

export function salvarOP(op: Omit<OrdemProducao, 'id' | 'numeroOP' | 'dataEmissao'>): OrdemProducao {
  const ops = getOPs();
  
  const novaOP: OrdemProducao = {
    ...op,
    id: Date.now().toString(),
    numeroOP: gerarNumeroOP(),
    dataEmissao: new Date().toISOString()
  };
  
  ops.push(novaOP);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ops));
  
  return novaOP;
}

export function getOPs(): OrdemProducao[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function getOPById(id: string): OrdemProducao | null {
  const ops = getOPs();
  return ops.find(op => op.id === id) || null;
}

export function updateOP(id: string, updates: Partial<OrdemProducao>): boolean {
  const ops = getOPs();
  const index = ops.findIndex(op => op.id === id);
  
  if (index === -1) return false;
  
  ops[index] = { ...ops[index], ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ops));
  
  return true;
}

export function deleteOP(id: string): boolean {
  const ops = getOPs();
  const filtered = ops.filter(op => op.id !== id);
  
  if (filtered.length === ops.length) return false;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

export const PROCESSOS_PADRAO: ProcessoOP[] = [
  { ordem: 1, nome: 'Engenharia' },
  { ordem: 2, nome: 'Programação' },
  { ordem: 3, nome: 'Corte' },
  { ordem: 4, nome: 'Dobra' },
  { ordem: 5, nome: 'Tubo' },
  { ordem: 6, nome: 'Solda' },
  { ordem: 7, nome: 'Mobiliário' },
  { ordem: 8, nome: 'Cocção' },
  { ordem: 9, nome: 'Refrigeração' },
  { ordem: 10, nome: 'Embalagem' }
];
