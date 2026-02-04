import React, { useState } from 'react';
import { FileText, Download, Printer, Users } from 'lucide-react';
import { toast } from 'sonner';
import { ClienteManager } from './ClienteManager';
import type { Cliente } from '../utils/clienteStorage';
import type { BOMResult } from '../utils/bomCalculator';
import { salvarOP, PROCESSOS_PADRAO, type OrdemProducao } from '../utils/ordemProducao';
import { exportOPToPDF } from '../utils/opPdfExporter';

interface OrdemProducaoGeneratorProps {
  bom: BOMResult;
  mesaConfig: {
    comprimento: number;
    largura: number;
    altura: number;
    material: string;
    espessura: number;
  };
}

export function OrdemProducaoGenerator({ bom, mesaConfig }: OrdemProducaoGeneratorProps) {
  const [showClienteSelector, setShowClienteSelector] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState({
    codigoProduto: '',
    numeroPedido: '',
    prazo: '',
    qtde: 1,
    unidade: 'UN',
    observacoes: '',
    informacoesAdicionais: ''
  });

  const handleSelectCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setShowClienteSelector(false);
    toast.success(`Cliente ${cliente.nome} selecionado`);
  };

  const handleGerarOP = () => {
    if (!selectedCliente) {
      toast.error('Selecione um cliente primeiro');
      return;
    }

    if (!formData.prazo) {
      toast.error('Defina o prazo de entrega');
      return;
    }

    try {
      const descricaoProduto = `BANCADA INOX ${mesaConfig.material} - ${mesaConfig.comprimento}x${mesaConfig.largura}x${mesaConfig.altura}MM - ESP ${mesaConfig.espessura}MM`;

      const op = salvarOP({
        cliente: selectedCliente,
        codigoProduto: formData.codigoProduto || 'S' + Date.now().toString().slice(-6),
        descricaoProduto,
        numeroPedido: formData.numeroPedido,
        prazo: formData.prazo,
        qtde: formData.qtde,
        unidade: formData.unidade,
        bom,
        observacoes: formData.observacoes,
        processos: PROCESSOS_PADRAO,
        revisoes: [],
        informacoesAdicionais: formData.informacoesAdicionais
      });

      toast.success(`OP ${op.numeroOP} gerada com sucesso!`);
      
      // Opção de download imediato
      if (confirm('Deseja fazer o download do PDF agora?')) {
        exportOPToPDF(op);
      }

      // Resetar form
      setFormData({
        codigoProduto: '',
        numeroPedido: '',
        prazo: '',
        qtde: 1,
        unidade: 'UN',
        observacoes: '',
        informacoesAdicionais: ''
      });
      
    } catch (error) {
      toast.error('Erro ao gerar ordem de produção');
      console.error(error);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="w-6 h-6 text-purple-600" />
        <h2 className="text-xl font-bold text-gray-900">
          Gerar Ordem de Produção
        </h2>
      </div>

      {/* Cliente Selecionado */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cliente
        </label>
        {selectedCliente ? (
          <div className="bg-white border-2 border-indigo-300 rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">{selectedCliente.nome}</div>
              {selectedCliente.cnpj && (
                <div className="text-sm text-gray-600">CNPJ: {selectedCliente.cnpj}</div>
              )}
            </div>
            <button
              onClick={() => setShowClienteSelector(true)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Alterar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowClienteSelector(true)}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5" />
            Selecionar Cliente
          </button>
        )}
      </div>

      {/* Formulário */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Código do Produto
          </label>
          <input
            type="text"
            value={formData.codigoProduto}
            onChange={(e) => setFormData({ ...formData, codigoProduto: e.target.value })}
            placeholder="Auto-gerado se vazio"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nº do Pedido
          </label>
          <input
            type="text"
            value={formData.numeroPedido}
            onChange={(e) => setFormData({ ...formData, numeroPedido: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prazo de Entrega *
          </label>
          <input
            type="date"
            value={formData.prazo}
            onChange={(e) => setFormData({ ...formData, prazo: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qtde
            </label>
            <input
              type="number"
              min="1"
              value={formData.qtde}
              onChange={(e) => setFormData({ ...formData, qtde: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unid.
            </label>
            <select
              value={formData.unidade}
              onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="UN">UN</option>
              <option value="KG">KG</option>
              <option value="PC">PC</option>
            </select>
          </div>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observações
          </label>
          <textarea
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            placeholder="Informações adicionais sobre a ordem..."
          />
        </div>
      </div>

      {/* Preview da Descrição */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="text-sm font-medium text-gray-700 mb-2">
          Descrição do Produto:
        </div>
        <div className="text-sm text-gray-900">
          BANCADA INOX {mesaConfig.material} - {mesaConfig.comprimento}x{mesaConfig.largura}x{mesaConfig.altura}MM - ESP {mesaConfig.espessura}MM
        </div>
      </div>

      {/* Botão Gerar */}
      <button
        onClick={handleGerarOP}
        disabled={!selectedCliente || !formData.prazo}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg disabled:cursor-not-allowed"
      >
        <Download className="w-5 h-5" />
        Gerar Ordem de Produção
      </button>

      {/* Modal Cliente Selector */}
      {showClienteSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Selecionar Cliente</h3>
              <button
                onClick={() => setShowClienteSelector(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <ClienteManager onSelectCliente={handleSelectCliente} compact />
          </div>
        </div>
      )}
    </div>
  );
}
