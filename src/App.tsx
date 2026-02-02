import React, { useState } from 'react';
import { Calculator, Package, Maximize, FileDown, Save } from 'lucide-react';
import { BOMCalculator } from './components/BOMCalculator';
import { NestingVisualizer } from './components/NestingVisualizer';
import { CostCalculator, type CostData } from './components/CostCalculator';
import { ProjectHistory } from './components/ProjectHistory';
import { gerarBOMIndustrial, expandirPecas } from './utils/bomCalculator';
import { executarNesting } from './utils/nestingAlgorithm';
import { exportToPDF, exportToCSV } from './utils/pdfExporter';
import { saveProject, type SavedProject } from './utils/projectStorage';
import type { BOMResult } from './utils/bomCalculator';
import type { NestingResult } from './utils/nestingAlgorithm';

export default function App() {
  const [dimensions, setDimensions] = useState({
    comprimento: 1300,
    largura: 700,
    altura: 900
  });
  const [selectedSheet, setSelectedSheet] = useState(0);
  const [bom, setBom] = useState<BOMResult | null>(null);
  const [nestingResult, setNestingResult] = useState<NestingResult | null>(null);
  const [costData, setCostData] = useState<CostData | null>(null);
  const [projectName, setProjectName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const CHAPAS_INDUSTRIAIS = [
    { name: "2000 x 1250", width: 2000, height: 1250 },
    { name: "2500 x 1250", width: 2500, height: 1250 },
    { name: "3000 x 1250", width: 3000, height: 1250 },
  ];

  const handleCalculate = () => {
    // Calculate BOM
    const bomResult = gerarBOMIndustrial(
      dimensions.comprimento,
      dimensions.largura,
      dimensions.altura
    );
    setBom(bomResult);

    // Expand pieces and run nesting
    const pecas = expandirPecas(bomResult.bom);
    const sheet = CHAPAS_INDUSTRIAIS[selectedSheet];
    const nestingRes = executarNesting(pecas, sheet.width, sheet.height);
    setNestingResult(nestingRes);
  };

  const handleExportPDF = () => {
    if (!bom || !nestingResult) return;

    exportToPDF({
      dimensions,
      sheet: CHAPAS_INDUSTRIAIS[selectedSheet],
      bom,
      nesting: nestingResult,
      custo: costData ? {
        materialTotal: costData.custoMaterial,
        precoVenda: costData.precoVenda,
        margemLucro: costData.margemLucro,
      } : undefined,
    });
  };

  const handleExportCSV = () => {
    if (!bom) return;
    exportToCSV(bom);
  };

  const handleSaveProject = () => {
    if (!projectName.trim()) {
      alert('Por favor, insira um nome para o projeto');
      return;
    }

    saveProject({
      name: projectName,
      dimensions,
      selectedSheet,
    });

    setShowSaveDialog(false);
    setProjectName('');
    alert('Projeto salvo com sucesso!');
  };

  const handleLoadProject = (project: SavedProject) => {
    setDimensions(project.dimensions);
    setSelectedSheet(project.selectedSheet);
    // Automatically calculate after loading
    setTimeout(() => handleCalculate(), 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Nesting Industrial - Mesa Inox
                </h1>
                <p className="text-sm text-gray-600">
                  Sistema completo de otimização de corte para mesas industriais
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ProjectHistory onLoadProject={handleLoadProject} />
              
              {bom && nestingResult && (
                <>
                  <button
                    onClick={() => setShowSaveDialog(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Salvar Projeto
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-green-700 hover:bg-green-50 rounded-md transition-colors"
                  >
                    <FileDown className="w-4 h-4" />
                    CSV
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm"
                  >
                    <FileDown className="w-4 h-4" />
                    Exportar PDF
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Calculator className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Dimensões da Mesa
                </h2>
              </div>

              <div className="space-y-4">
                {/* Comprimento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comprimento (C) - mm
                  </label>
                  <input
                    type="number"
                    value={dimensions.comprimento}
                    onChange={(e) => setDimensions({
                      ...dimensions,
                      comprimento: Number(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="500"
                    max="5000"
                    step="10"
                  />
                </div>

                {/* Largura */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Largura (L) - mm
                  </label>
                  <input
                    type="number"
                    value={dimensions.largura}
                    onChange={(e) => setDimensions({
                      ...dimensions,
                      largura: Number(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="400"
                    max="2000"
                    step="10"
                  />
                </div>

                {/* Altura */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Altura (A) - mm
                  </label>
                  <input
                    type="number"
                    value={dimensions.altura}
                    onChange={(e) => setDimensions({
                      ...dimensions,
                      altura: Number(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="700"
                    max="1200"
                    step="10"
                  />
                </div>

                {/* Chapa Padrão */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chapa Padrão
                  </label>
                  <select
                    value={selectedSheet}
                    onChange={(e) => setSelectedSheet(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CHAPAS_INDUSTRIAIS.map((chapa, idx) => (
                      <option key={idx} value={idx}>
                        {chapa.name} mm
                      </option>
                    ))}
                  </select>
                </div>

                {/* Calculate Button */}
                <button
                  onClick={handleCalculate}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center gap-2 mt-6"
                >
                  <Maximize className="w-5 h-5" />
                  Calcular BOM e Nesting
                </button>
              </div>

              {/* Quick Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Informações
                </h3>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>• Espessura padrão: 0.8mm</p>
                  <p>• Cálculo automático de reforços</p>
                  <p>• Otimização de corte automática</p>
                  <p>• Zoom e pan no canvas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            {!bom && !nestingResult ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aguardando Cálculo
                </h3>
                <p className="text-gray-600">
                  Configure as dimensões da mesa e clique em "Calcular BOM e Nesting"
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {bom && <BOMCalculator bom={bom} />}
                
                {bom && (
                  <CostCalculator
                    bom={bom}
                    sheetArea={CHAPAS_INDUSTRIAIS[selectedSheet].width * CHAPAS_INDUSTRIAIS[selectedSheet].height}
                    onCostCalculated={setCostData}
                  />
                )}
                
                {nestingResult && (
                  <NestingVisualizer
                    result={nestingResult}
                    sheet={CHAPAS_INDUSTRIAIS[selectedSheet]}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Salvar Projeto
            </h3>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Nome do projeto (ex: Mesa Cozinha Industrial)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProject}
                className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
