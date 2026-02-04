// Gerenciamento de Clientes
export interface Cliente {
  id: string;
  nome: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  dataCadastro: string;
}

const STORAGE_KEY = 'clientes';

export function salvarCliente(cliente: Omit<Cliente, 'id' | 'dataCadastro'>): Cliente {
  const clientes = getClientes();
  
  const novoCliente: Cliente = {
    ...cliente,
    id: Date.now().toString(),
    dataCadastro: new Date().toISOString()
  };
  
  clientes.push(novoCliente);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clientes));
  
  return novoCliente;
}

export function getClientes(): Cliente[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function getClienteById(id: string): Cliente | null {
  const clientes = getClientes();
  return clientes.find(c => c.id === id) || null;
}

export function updateCliente(id: string, updates: Partial<Cliente>): boolean {
  const clientes = getClientes();
  const index = clientes.findIndex(c => c.id === id);
  
  if (index === -1) return false;
  
  clientes[index] = { ...clientes[index], ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clientes));
  
  return true;
}

export function deleteCliente(id: string): boolean {
  const clientes = getClientes();
  const filtered = clientes.filter(c => c.id !== id);
  
  if (filtered.length === clientes.length) return false;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}
