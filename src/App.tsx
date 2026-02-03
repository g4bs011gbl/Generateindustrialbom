import React, { useState } from 'react';
import { Calculator, Package, Maximize, FileDown, Save, AlertCircle } from 'lucide-react';
import { BOMCalculator } from './components/BOMCalculator';
import { NestingVisualizer } from './components/NestingVisualizer';
import { CostCalculator, type CostData } from './components/CostCalculator';
import { ProjectHistory } from './components/ProjectHistory';
import { MultiMesaManager, type MesaItem } from './components/MultiMesaManager';
import { 
  gerarBOMIndustrial, 
  expandirPecas, 
  agruparPecas,
  validarConfiguracao,
  type MesaConfig,
  type TipoMesa,
  type MaterialInox,
  type BOMResult,
  type GrupoPecas
} from './utils/bomCalculator';
import { executarNesting } from './utils/nestingAlgorithm';
import { exportToPDF, exportToCSV } from './utils/pdfExporter';
import { saveProject, type SavedProject } from './utils/projectStorage';
import type { NestingResult } from './utils/nestingAlgorithm';

export default function App() {
  const [modoMultiMesa, setModoMultiMesa] = useState(false);
  
  // Modo single mesa
  const [dimensions, setDimensions] = useState({
    comprimento: 1300,
    largura: 700,
    altura: 900
  });
  const [tipoMesa, setTipoMesa] = useState<TipoMesa>('simples');
  const [espelhos, setEspelhos] = useState({
    traseiro: false,
    lateral_esq: false,
    lateral_dir: false
  });
  const [material, setMaterial] = useState<MaterialInox>('304');
  const [espessuraChapa, setEspessuraChapa] = useState(0.8);
  
  // Multi mesa
  const [mesas, setMesas] = useState<MesaItem[]>([]);
  
  // Common state
  const [selectedSheet, setSelectedSheet] = useState(0);
  const [bom, setBom] = useState<BOMResult | null>(null);
  const [nestingResult, setNestingResult] = useState<NestingResult | null>(null);
  const [costData, setCostData] = useState<CostData | null>(null);
  const [projectName, setProjectName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const CHAPAS_INDUSTRIAIS = [
    { name: "2000 x 1250", width: 2000, height: 1250 },
    { name: "2500 x 1250", width: 2500, height: 1250 },
    { name: "3000 x 1250", width: 3000, height: 1250 },
  ];

  const handleCalculateSingle = () => {
    setErro(null);
    
    try {
      const config: MesaConfig = {
        c: dimensions.comprimento,
        l: dimensions.largura,
        a: dimensions.altura,
        tipo_mesa: tipoMesa,
        espelho_traseiro: espelhos.traseiro,
        espelho_lateral_esq: espelhos.lateral_esq,
        espelho_lateral_dir: espelhos.lateral_dir,
        material: material,
        espessura_chapa: espessuraChapa
      };
      
      // Validar configuração
      const validacao = validarConfiguracao(config);
      if (!validacao.valido) {
        setErro(validacao.erro || 'Configuração inválida');
        return;
      }
      
      // Calculate BOM
      const bomResult = gerarBOMIndustrial(config);
      setBom(bomResult);

      // Expand pieces and run nesting
      const pecas = expandirPecas(bomResult.bom);
      const sheet = CHAPAS_INDUSTRIAIS[selectedSheet];
      const nestingRes = executarNesting(pecas, sheet.width, sheet.height);
      setNestingResult(nestingRes);
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao calcular BOM');
      console.error('Erro:', error);
    }
  };

  const handleCalculateMulti = () => {
    setErro(null);
    
    try {
      if (mesas.length === 0) {
        setErro('Adicione pelo menos uma mesa');
        return;
      }
      
      // Gerar BOM para todas as mesas
      const todasPecas: any[] = [];
      
      for (const mesa of mesas) {
        // Validar cada mesa
        const validacao = validarConfiguracao(mesa.config);
        if (!validacao.valido) {
          setErro(`${mesa.nome}: ${validacao.erro}`);
          return;
        }
        
        // Gerar BOM
        for (let i = 0; i < mesa.quantidade; i++) {
          const bomResult = gerarBOMIndustrial(mesa.config);
          const pecas = expandirPecas(bomResult.bom);
          todasPecas.push(...pecas);
        }
      }
      
      // Agrupar peças por material + espessura
      const grupos = agruparPecas(todasPecas);
      
      // Executar nesting para cada grupo
      const sheet = CHAPAS_INDUSTRIAIS[selectedSheet];
      
      // Por simplicidade, vamos pegar o primeiro grupo
      // Em produção, você executaria nesting para cada grupo
      if (grupos.length > 0) {
        const primeiroGrupo = grupos[0];
        const nestingRes = executarNesting(
          primeiroGrupo.pecas,
          sheet.width,
          sheet.height
        );
        setNestingResult(nestingRes);
        
        // Criar BOM consolidado (simplificado)
        const bomConsolidado = gerarBOMIndustrial(mesas[0].config);
        setBom(bomConsolidado);
      }
      
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao calcular multi-mesa');
      console.error('Erro:', error);
    }
  };

  const handleCalculate = () => {
    if (modoMultiMesa) {
      handleCalculateMulti();
    } else {
      handleCalculateSingle();
    }
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
    setTimeout(() => handleCalculate(), 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 border-b border-blue-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-white" />
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Sistema Industrial de Bancadas Inox
                </h1>
                <p className="text-sm text-blue-100">
                  Nesting profissional + BOM + Custos - Pronto para chão de fábrica
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ProjectHistory onLoadProject={handleLoadProject} />
              
              {bom && nestingResult && (
                <>
                  <button
                    onClick={() => setShowSaveDialog(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Salvar
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors"
                  >
                    <FileDown className="w-4 h-4" />
                    CSV
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-blue-50 text-blue-700 rounded-md transition-colors text-sm font-medium"
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
        {/* Toggle Multi-Mesa */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Modo de Operação</h3>
              <p className="text-sm text-gray-600">
                {modoMultiMesa ? 'Otimização de múltiplas mesas' : 'Mesa individual'}
              </p>
            </div>
            <button
              onClick={() => setModoMultiMesa(!modoMultiMesa)}
              className={`px-4 py-2 rounded-md transition-colors ${
                modoMultiMesa
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {modoMultiMesa ? 'Modo Multi-Mesa' : 'Modo Single'}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {erro && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900">Erro de Validação</h3>
              <p className="text-sm text-red-700 mt-1">{erro}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-1">
            {modoMultiMesa ? (
              <MultiMesaManager onMesasChange={setMesas} />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Configuração da Mesa
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Dimensões */}
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

                  {/* Tipo de Mesa */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Mesa
                    </label>
                    <select
                      value={tipoMesa}
                      onChange={(e) => setTipoMesa(e.target.value as TipoMesa)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="simples">Simples (sem contraventamento/prateleira)</option>
                      <option value="contraventada">Contraventada</option>
                      <option value="prateleira">Com Prateleira</option>
                    </select>
                  </div>

                  {/* Material */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Material
                    </label>
                    <select
                      value={material}
                      onChange={(e) => setMaterial(e.target.value as MaterialInox)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="430">Inox 430</option>
                      <option value="304">Inox 304</option>
                      <option value="316">Inox 316</option>
                    </select>
                  </div>

                  {/* Espessura */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Espessura da Chapa
                    </label>
                    <select
                      value={espessuraChapa}
                      onChange={(e) => setEspessuraChapa(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="0.8">0.8 mm</option>
                      <option value="1.0">1.0 mm</option>
                      <option value="1.2">1.2 mm</option>
                      <option value="1.5">1.5 mm</option>
                    </select>
                  </div>

                  {/* Espelhos */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Espelhos
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={espelhos.traseiro}
                          onChange={(e) => setEspelhos({
                            ...espelhos,
                            traseiro: e.target.checked
                          })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Espelho Traseiro</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={espelhos.lateral_esq}
                          onChange={(e) => setEspelhos({
                            ...espelhos,
                            lateral_esq: e.target.checked
                          })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Espelho Lateral Esquerdo</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={espelhos.lateral_dir}
                          onChange={(e) => setEspelhos({
                            ...espelhos,
                            lateral_dir: e.target.checked
                          })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Espelho Lateral Direito</span>
                      </label>
                    </div>
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
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-md transition-all flex items-center justify-center gap-2 mt-6 shadow-lg"
                  >
                    <Maximize className="w-5 h-5" />
                    Calcular BOM e Nesting
                  </button>
                </div>
              </div>
            )}

            {/* Botão de cálculo para multi-mesa */}
            {modoMultiMesa && (
              <button
                onClick={handleCalculate}
                className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-md transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Maximize className="w-5 h-5" />
                Calcular Multi-Mesa
              </button>
            )}
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
                  Configure a mesa e clique em "Calcular BOM e Nesting"
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
              placeholder="Nome do projeto"
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
