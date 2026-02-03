import React from 'react';
import { Package, Wrench, Ruler, Box } from 'lucide-react';
import type { BOMResult } from '../utils/bomCalculator';

interface BOMCalculatorProps {
  bom: BOMResult;
}

export function BOMCalculator({ bom }: BOMCalculatorProps) {
  const totalPecasChapa = bom.bom.reduce((sum, item) => sum + item.qtd, 0);
  const areaTotal = bom.bom.reduce((sum, item) => {
    return sum + (item.w * item.h * item.qtd);
  }, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Package className="w-5 h-5 text-green-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          Bill of Materials (BOM)
        </h2>
      </div>

      {/* Peças de Chapa */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Ruler className="w-4 h-4" />
          Peças de Chapa
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-medium text-gray-700">
                  Descrição
                </th>
                <th className="text-center py-2 px-3 font-medium text-gray-700">
                  Qtd
                </th>
                <th className="text-right py-2 px-3 font-medium text-gray-700">
                  Largura (mm)
                </th>
                <th className="text-right py-2 px-3 font-medium text-gray-700">
                  Altura (mm)
                </th>
                <th className="text-right py-2 px-3 font-medium text-gray-700">
                  Espessura (mm)
                </th>
                <th className="text-right py-2 px-3 font-medium text-gray-700">
                  Processo
                </th>
              </tr>
            </thead>
            <tbody>
              {bom.bom.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-2 px-3 text-gray-900">{item.desc}</td>
                  <td className="py-2 px-3 text-center text-gray-900">
                    {item.qtd}
                  </td>
                  <td className="py-2 px-3 text-right text-gray-700">
                    {item.w.toFixed(1)}
                  </td>
                  <td className="py-2 px-3 text-right text-gray-700">
                    {item.h.toFixed(1)}
                  </td>
                  <td className="py-2 px-3 text-right text-gray-700">
                    {item.espessura?.toFixed(1) || '0.8'}
                  </td>
                  <td className="py-2 px-3 text-right text-gray-700">
                    {item.processo || 'LASER'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-medium">
                <td className="py-2 px-3 text-gray-900">TOTAL PEÇAS</td>
                <td className="py-2 px-3 text-center text-gray-900">
                  {totalPecasChapa}
                </td>
                <td colSpan={4} className="py-2 px-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Casquilhos */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Box className="w-4 h-4" />
          Casquilhos
        </h3>
        <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">
              Quantidade:
            </span>
            <span className="text-sm font-medium text-gray-900">
              {bom.casquilhos.qtd} unidades
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-700">
              Dimensões:
            </span>
            <span className="text-sm font-medium text-gray-900">
              {bom.casquilhos.dimensao} mm
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-700">
              Espessura:
            </span>
            <span className="text-sm font-medium text-gray-900">
              {bom.casquilhos.espessura.toFixed(1)} mm
            </span>
          </div>
        </div>
      </div>

      {/* Pés */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Wrench className="w-4 h-4" />
          Pés (Tubos Ø38,1mm)
        </h3>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">
              Quantidade de pés:
            </span>
            <span className="text-sm font-medium text-gray-900">
              {bom.pes.qtd} unidades
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-700">
              Comprimento do tubo:
            </span>
            <span className="text-sm font-medium text-gray-900">
              {bom.pes.tubo.toFixed(1)} mm
            </span>
          </div>
        </div>
      </div>

      {/* Contraventamentos */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Wrench className="w-4 h-4" />
          Contraventamentos (Tubo Ø1")
        </h3>
        {bom.contraventamentos ? (
          <div className="space-y-2">
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Quantidade total:</span>
                <span className="text-sm font-medium text-gray-900">
                  {bom.contraventamentos.qtd} unidades
                </span>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Lateral:</span>
                <span className="text-sm font-medium text-gray-900">
                  {bom.contraventamentos.lateral.toFixed(1)} mm
                </span>
              </div>
            </div>
            {bom.contraventamentos.traseiro > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Traseiro:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {bom.contraventamentos.traseiro.toFixed(1)} mm
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
            <p className="text-sm text-gray-500 text-center">
              Sem contraventamentos
            </p>
          </div>
        )}
      </div>

      {/* Prateleira */}
      {bom.prateleira && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Prateleira
          </h3>
          <div className="bg-indigo-50 border border-indigo-200 rounded-md p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Dimensões:</span>
              <span className="text-sm font-medium text-gray-900">
                {bom.prateleira.w.toFixed(1)} × {bom.prateleira.h.toFixed(1)} mm
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-700">Espessura:</span>
              <span className="text-sm font-medium text-gray-900">
                {bom.prateleira.espessura.toFixed(1)} mm
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}