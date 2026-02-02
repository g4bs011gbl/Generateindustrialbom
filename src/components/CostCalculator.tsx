import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calculator } from 'lucide-react';
import type { BOMResult } from '../utils/bomCalculator';

interface CostCalculatorProps {
  bom: BOMResult;
  sheetArea: number; // em mm²
  onCostCalculated?: (cost: CostData) => void;
}

export interface CostData {
  precoChapaPorKg: number;
  densidadeInox: number;
  espessuraChapa: number;
  pesoMaterial: number;
  custoMaterial: number;
  custoMaoDeObra: number;
  custoTubos: number;
  custoOutros: number;
  custoTotal: number;
  margemLucro: number;
  precoVenda: number;
}

export function CostCalculator({ bom, sheetArea, onCostCalculated }: CostCalculatorProps) {
  const [precoChapaPorKg, setPrecoChapaPorKg] = useState(45.0); // R$/kg
  const [precoTuboPorMetro, setPrecoTuboPorMetro] = useState(25.0); // R$/metro
  const [custoMaoDeObra, setCustoMaoDeObra] = useState(150.0); // R$
  const [custoOutros, setCustoOutros] = useState(50.0); // R$ (soldas, parafusos, etc)
  const [margemLucro, setMargemLucro] = useState(40.0); // %

  const densidadeInox = 7.93; // g/cm³
  const espessuraChapa = 0.8; // mm

  // Calcular área total das peças
  const areaTotalPecas = bom.bom.reduce((sum, item) => {
    return sum + (item.w * item.h * item.qtd);
  }, 0);

  // Converter área de mm² para cm²
  const areaTotalCm2 = areaTotalPecas / 100;

  // Calcular volume em cm³
  const volumeCm3 = areaTotalCm2 * espessuraChapa / 10;

  // Calcular peso em kg
  const pesoMaterial = (volumeCm3 * densidadeInox) / 1000;

  // Custo do material
  const custoMaterial = pesoMaterial * precoChapaPorKg;

  // Custo dos tubos dos pés
  const comprimentoTotalTubos = (bom.pes.tubo * bom.pes.qtd) / 1000; // metros
  const custoTubos = comprimentoTotalTubos * precoTuboPorMetro;

  // Custo total
  const custoTotal = custoMaterial + custoMaoDeObra + custoTubos + custoOutros;

  // Preço de venda
  const precoVenda = custoTotal * (1 + margemLucro / 100);

  // Lucro
  const lucroReal = precoVenda - custoTotal;

  useEffect(() => {
    if (onCostCalculated) {
      onCostCalculated({
        precoChapaPorKg,
        densidadeInox,
        espessuraChapa,
        pesoMaterial,
        custoMaterial,
        custoMaoDeObra,
        custoTubos,
        custoOutros,
        custoTotal,
        margemLucro,
        precoVenda,
      });
    }
  }, [
    precoChapaPorKg,
    custoMaoDeObra,
    custoTubos,
    custoOutros,
    margemLucro,
    pesoMaterial,
    custoMaterial,
    custoTotal,
    precoVenda,
    onCostCalculated,
  ]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <DollarSign className="w-5 h-5 text-green-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          Calculadora de Custos
        </h2>
      </div>

      {/* Inputs de Configuração */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preço Chapa Inox (R$/kg)
          </label>
          <input
            type="number"
            value={precoChapaPorKg}
            onChange={(e) => setPrecoChapaPorKg(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            step="0.1"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preço Tubo (R$/metro)
          </label>
          <input
            type="number"
            value={precoTuboPorMetro}
            onChange={(e) => setPrecoTuboPorMetro(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            step="0.1"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mão de Obra (R$)
          </label>
          <input
            type="number"
            value={custoMaoDeObra}
            onChange={(e) => setCustoMaoDeObra(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            step="10"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Outros Custos (R$)
          </label>
          <input
            type="number"
            value={custoOutros}
            onChange={(e) => setCustoOutros(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            step="10"
            min="0"
          />
        </div>
      </div>

      {/* Margem de Lucro */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Margem de Lucro (%)
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            value={margemLucro}
            onChange={(e) => setMargemLucro(Number(e.target.value))}
            className="flex-1"
            min="0"
            max="100"
            step="5"
          />
          <span className="text-lg font-semibold text-gray-900 w-16 text-right">
            {margemLucro.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Resumo de Custos */}
      <div className="space-y-3 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-medium text-blue-900">Detalhamento</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Peso do Material:</span>
              <span className="font-medium text-gray-900">
                {pesoMaterial.toFixed(2)} kg
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Custo Material (Chapa):</span>
              <span className="font-medium text-gray-900">
                R$ {custoMaterial.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Custo Tubos:</span>
              <span className="font-medium text-gray-900">
                R$ {custoTubos.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Mão de Obra:</span>
              <span className="font-medium text-gray-900">
                R$ {custoMaoDeObra.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Outros:</span>
              <span className="font-medium text-gray-900">
                R$ {custoOutros.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Totais */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-md p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-green-200">
              <span className="text-sm font-medium text-gray-700">Custo Total:</span>
              <span className="text-xl font-bold text-gray-900">
                R$ {custoTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Preço de Venda:</span>
              </div>
              <span className="text-2xl font-bold text-green-600">
                R$ {precoVenda.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Lucro:</span>
              <span className="font-semibold text-green-700">
                R$ {lucroReal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Informações Adicionais */}
      <div className="text-xs text-gray-500 bg-gray-50 rounded-md p-3">
        <p>💡 <strong>Dica:</strong> Ajuste a margem de lucro de acordo com seu mercado.</p>
        <p className="mt-1">📊 Densidade do aço inox: {densidadeInox} g/cm³</p>
        <p>📏 Espessura da chapa: {espessuraChapa} mm</p>
      </div>
    </div>
  );
}
