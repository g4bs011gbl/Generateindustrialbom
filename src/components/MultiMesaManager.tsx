import React, { useState } from 'react';
import { Plus, Trash2, Copy, Package, AlertCircle, Layers } from 'lucide-react';
import type { MesaConfig, TipoMesa, MaterialInox } from '../utils/bomCalculator';

export interface MesaItem {
  id: string;
  nome: string;
  config: MesaConfig;
  quantidade: number;
}

interface MultiMesaManagerProps {
  onMesasChange: (mesas: MesaItem[]) => void;
}

export function MultiMesaManager({ onMesasChange }: MultiMesaManagerProps) {
  const [mesas, setMesas] = useState<MesaItem[]>([
    {
      id: '1',
      nome: 'Mesa 1',
      config: {
        c: 1300,
        l: 700,
        a: 900,
        tipo_mesa: 'simples',
        espelho_traseiro: false,
        espelho_lateral_esq: false,
        espelho_lateral_dir: false,
        material: '304',
        espessura_chapa: 0.8
      },
      quantidade: 1
    },
  ]);

  const addMesa = () => {
    const newMesa: MesaItem = {
      id: Date.now().toString(),
      nome: `Mesa ${mesas.length + 1}`,
      config: {
        c: 1300,
        l: 700,
        a: 900,
        tipo_mesa: 'simples',
        espelho_traseiro: false,
        espelho_lateral_esq: false,
        espelho_lateral_dir: false,
        material: '304',
        espessura_chapa: 0.8
      },
      quantidade: 1
    };
    const updated = [...mesas, newMesa];
    setMesas(updated);
    onMesasChange(updated);
  };

  const removeMesa = (id: string) => {
    const updated = mesas.filter((m) => m.id !== id);
    setMesas(updated);
    onMesasChange(updated);
  };

  const duplicateMesa = (mesa: MesaItem) => {
    const newMesa: MesaItem = {
      ...mesa,
      id: Date.now().toString(),
      nome: `${mesa.nome} (cópia)`
    };
    const updated = [...mesas, newMesa];
    setMesas(updated);
    onMesasChange(updated);
  };

  const updateMesa = (id: string, updates: Partial<MesaItem>) => {
    const updated = mesas.map((m) =>
      m.id === id ? { ...m, ...updates } : m
    );
    setMesas(updated);
    onMesasChange(updated);
  };

  const updateConfig = (id: string, configUpdates: Partial<MesaConfig>) => {
    const updated = mesas.map((m) =>
      m.id === id ? { ...m, config: { ...m.config, ...configUpdates } } : m
    );
    setMesas(updated);
    onMesasChange(updated);
  };

  const totalMesas = mesas.reduce((sum, m) => sum + m.quantidade, 0);

  // Validar se mesa tem configuração inválida (contraventada + prateleira)
  const validarMesa = (config: MesaConfig): boolean => {
    return !(config.tipo_mesa === 'contraventada' && config.tipo_mesa === 'prateleira');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Gerenciador Multi-Mesas
          </h2>
        </div>
        <div className="text-sm text-gray-600">
          Total: <span className="font-semibold text-indigo-600">{totalMesas}</span> mesa{totalMesas !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {mesas.map((mesa, index) => (
          <div
            key={mesa.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <input
                type="text"
                value={mesa.nome}
                onChange={(e) => updateMesa(mesa.id, { nome: e.target.value })}
                className="text-sm font-medium text-gray-900 border-b border-transparent hover:border-gray-300 focus:border-indigo-500 outline-none px-1"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => duplicateMesa(mesa)}
                  className="p-1 text-gray-500 hover:text-indigo-600 transition-colors"
                  title="Duplicar mesa"
                >
                  <Copy className="w-4 h-4" />
                </button>
                {mesas.length > 1 && (
                  <button
                    onClick={() => removeMesa(mesa.id)}
                    className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                    title="Remover mesa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              {/* Dimensões */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Comprimento (mm)
                </label>
                <input
                  type="number"
                  value={mesa.config.c}
                  onChange={(e) => updateConfig(mesa.id, { c: Number(e.target.value) })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="500"
                  max="5000"
                  step="10"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Largura (mm)
                </label>
                <input
                  type="number"
                  value={mesa.config.l}
                  onChange={(e) => updateConfig(mesa.id, { l: Number(e.target.value) })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="400"
                  max="2000"
                  step="10"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Altura (mm)
                </label>
                <input
                  type="number"
                  value={mesa.config.a}
                  onChange={(e) => updateConfig(mesa.id, { a: Number(e.target.value) })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="700"
                  max="1200"
                  step="10"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              {/* Tipo de Mesa */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Tipo
                </label>
                <select
                  value={mesa.config.tipo_mesa}
                  onChange={(e) => updateConfig(mesa.id, { tipo_mesa: e.target.value as TipoMesa })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="simples">Simples</option>
                  <option value="contraventada">Contraventada</option>
                  <option value="prateleira">Prateleira</option>
                </select>
              </div>

              {/* Material */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Material
                </label>
                <select
                  value={mesa.config.material}
                  onChange={(e) => updateConfig(mesa.id, { material: e.target.value as MaterialInox })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="430">Inox 430</option>
                  <option value="304">Inox 304</option>
                  <option value="316">Inox 316</option>
                </select>
              </div>

              {/* Espessura */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Espessura (mm)
                </label>
                <select
                  value={mesa.config.espessura_chapa}
                  onChange={(e) => updateConfig(mesa.id, { espessura_chapa: Number(e.target.value) })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="0.8">0.8 mm</option>
                  <option value="1.0">1.0 mm</option>
                  <option value="1.2">1.2 mm</option>
                  <option value="1.5">1.5 mm</option>
                </select>
              </div>
            </div>

            {/* Espelhos */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Espelhos
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={mesa.config.espelho_traseiro}
                    onChange={(e) => updateConfig(mesa.id, { espelho_traseiro: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Traseiro
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={mesa.config.espelho_lateral_esq}
                    onChange={(e) => updateConfig(mesa.id, { espelho_lateral_esq: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Lateral Esq
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={mesa.config.espelho_lateral_dir}
                    onChange={(e) => updateConfig(mesa.id, { espelho_lateral_dir: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Lateral Dir
                </label>
              </div>
            </div>

            {/* Quantidade */}
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-600">
                Quantidade
              </label>
              <input
                type="number"
                value={mesa.quantidade}
                onChange={(e) => updateMesa(mesa.id, { quantidade: Number(e.target.value) })}
                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="1"
                max="100"
              />
            </div>

            {/* Validação */}
            {!validarMesa(mesa.config) && (
              <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
                <AlertCircle className="w-4 h-4" />
                <span>Configuração inválida detectada</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addMesa}
        className="w-full mt-4 py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Adicionar Nova Mesa
      </button>
    </div>
  );
}
