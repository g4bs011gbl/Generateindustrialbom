import React, { useState } from 'react';
import { Toaster } from 'sonner';
import { Calculator, Package, FileText, Users as UsersIcon, LogOut, Menu, X } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { BOMCalculator } from './components/BOMCalculator';
import { NestingVisualizer } from './components/NestingVisualizer';
import { CostCalculator, type CostData } from './components/CostCalculator';
import { MultiMesaManager, type MesaItem } from './components/MultiMesaManager';
import { ClienteManager } from './components/ClienteManager';
import { OrdemProducaoGenerator } from './components/OrdemProducaoGenerator';
import { ConfiguracoesEmpresa } from './components/ConfiguracoesEmpresa';
import { 
  gerarBOMIndustrial, 
  expandirPecas, 
  agruparPecas,
  validarConfiguracao,
  type MesaConfig,
  type TipoMesa,
  type MaterialInox,
  type BOMResult
} from './utils/bomCalculator';
import { executarNesting } from './utils/nestingAlgorithm';
import type { NestingResult } from './utils/nestingAlgorithm';
import { toast } from 'sonner';

type TabType = 'producao' | 'clientes' | 'ordens';

function AppContent() {
  const { user, logout, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('producao');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Modo multi-mesa
  const [modoMultiMesa, setModoMultiMesa] = useState(false);
  
  // Single mesa
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
  
  // Results
  const [selectedSheet, setSelectedSheet] = useState(0);
  const [bom, setBom] = useState<BOMResult | null>(null);
  const [nestingResult, setNestingResult] = useState<NestingResult | null>(null);
  const [costData, setCostData] = useState<CostData | null>(null);

  const CHAPAS_INDUSTRIAIS = [
    { name: "2000 x 1250", width: 2000, height: 1250 },
    { name: "2500 x 1250", width: 2500, height: 1250 },
    { name: "3000 x 1250", width: 3000, height: 1250 },
  ];

  const handleCalculateSingle = () => {
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
      
      const validacao = validarConfiguracao(config);
      if (!validacao.valido) {
        toast.error(validacao.erro || 'Configuração inválida');
        return;
      }
      
      const bomResult = gerarBOMIndustrial(config);
      setBom(bomResult);

      const pecas = expandirPecas(bomResult.bom);
      const sheet = CHAPAS_INDUSTRIAIS[selectedSheet];
      const nestingRes = executarNesting(pecas, sheet.width, sheet.height);
      setNestingResult(nestingRes);
      
      toast.success('Cálculos realizados com sucesso!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao calcular');
      console.error(error);
    }
  };

  const handleCalculateMulti = () => {
    try {
      if (mesas.length === 0) {
        toast.error('Adicione pelo menos uma mesa');
        return;
      }
      
      const todasPecas: any[] = [];
      
      for (const mesa of mesas) {
        const validacao = validarConfiguracao(mesa.config);
        if (!validacao.valido) {
          toast.error(`${mesa.nome}: ${validacao.erro}`);
          return;
        }
        
        for (let i = 0; i < mesa.quantidade; i++) {
          const bomResult = gerarBOMIndustrial(mesa.config);
          const pecas = expandirPecas(bomResult.bom);
          todasPecas.push(...pecas);
        }
      }
      
      const grupos = agruparPecas(todasPecas);
      const sheet = CHAPAS_INDUSTRIAIS[selectedSheet];
      
      if (grupos.length > 0) {
        const primeiroGrupo = grupos[0];
        const nestingRes = executarNesting(
          primeiroGrupo.pecas,
          sheet.width,
          sheet.height
        );
        setNestingResult(nestingRes);
        
        const bomConsolidado = gerarBOMIndustrial(mesas[0].config);
        setBom(bomConsolidado);
        
        toast.success(`${mesas.length} mesa(s) processada(s) com sucesso!`);
      }
    } catch (error) {
      toast.error('Erro ao calcular multi-mesa');
      console.error(error);
    }
  };

  const handleCalculate = () => {
    if (modoMultiMesa) {
      handleCalculateMulti();
    } else {
      handleCalculateSingle();
    }
  };

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position="top-right" richColors />
      
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-white"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              
              <Package className="w-8 h-8 text-white" />
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Sistema Industrial Inox
                </h1>
                <p className="text-sm text-indigo-100">
                  Gestão Profissional de Produção
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ConfiguracoesEmpresa />
              
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg">
                <div className="text-right">
                  <div className="text-sm font-medium text-white">{user?.nome}</div>
                  <div className="text-xs text-indigo-100">{user?.empresa}</div>
                </div>
              </div>
              
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 border-b border-white/20">
            <button
              onClick={() => setActiveTab('producao')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'producao'
                  ? 'bg-white/20 text-white border-b-2 border-white'
                  : 'text-indigo-100 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Produção
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('clientes')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'clientes'
                  ? 'bg-white/20 text-white border-b-2 border-white'
                  : 'text-indigo-100 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <UsersIcon className="w-4 h-4" />
                Clientes
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('ordens')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'ordens'
                  ? 'bg-white/20 text-white border-b-2 border-white'
                  : 'text-indigo-100 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Ordens de Produção
              </div>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab: Produção */}
        {activeTab === 'producao' && (
          <>
            {/* Toggle Multi-Mesa */}
            <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Modo de Operação</h3>
                  <p className="text-sm text-gray-600">
                    {modoMultiMesa ? 'Otimização de múltiplas mesas' : 'Mesa individual'}
                  </p>
                </div>
                <button
                  onClick={() => setModoMultiMesa(!modoMultiMesa)}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    modoMultiMesa
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {modoMultiMesa ? 'Multi-Mesa' : 'Single'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Input Panel */}
              <div className="lg:col-span-1 space-y-6">
                {modoMultiMesa ? (
                  <>
                    <MultiMesaManager onMesasChange={setMesas} />
                    <button
                      onClick={handleCalculate}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Calculator className="w-5 h-5" />
                      Calcular Multi-Mesa
                    </button>
                  </>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Calculator className="w-5 h-5 text-indigo-600" />
                      <h2 className="text-lg font-semibold text-gray-900">
                        Configuração da Mesa
                      </h2>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Comprimento (C) - mm
                        </label>
                        <input
                          type="number"
                          value={dimensions.comprimento}
                          onChange={(e) => setDimensions({ ...dimensions, comprimento: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                          onChange={(e) => setDimensions({ ...dimensions, largura: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                          onChange={(e) => setDimensions({ ...dimensions, altura: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          min="700"
                          max="1200"
                          step="10"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de Mesa
                        </label>
                        <select
                          value={tipoMesa}
                          onChange={(e) => setTipoMesa(e.target.value as TipoMesa)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="simples">Simples</option>
                          <option value="contraventada">Contraventada</option>
                          <option value="prateleira">Com Prateleira</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Material
                        </label>
                        <select
                          value={material}
                          onChange={(e) => setMaterial(e.target.value as MaterialInox)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="430">Inox 430</option>
                          <option value="304">Inox 304</option>
                          <option value="316">Inox 316</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Espessura
                        </label>
                        <select
                          value={espessuraChapa}
                          onChange={(e) => setEspessuraChapa(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="0.8">0.8 mm</option>
                          <option value="1.0">1.0 mm</option>
                          <option value="1.2">1.2 mm</option>
                          <option value="1.5">1.5 mm</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Espelhos
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={espelhos.traseiro}
                              onChange={(e) => setEspelhos({ ...espelhos, traseiro: e.target.checked })}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-700">Traseiro</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={espelhos.lateral_esq}
                              onChange={(e) => setEspelhos({ ...espelhos, lateral_esq: e.target.checked })}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-700">Lateral Esquerdo</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={espelhos.lateral_dir}
                              onChange={(e) => setEspelhos({ ...espelhos, lateral_dir: e.target.checked })}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-700">Lateral Direito</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Chapa Padrão
                        </label>
                        <select
                          value={selectedSheet}
                          onChange={(e) => setSelectedSheet(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          {CHAPAS_INDUSTRIAIS.map((chapa, idx) => (
                            <option key={idx} value={idx}>
                              {chapa.name} mm
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={handleCalculate}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg mt-6"
                      >
                        <Calculator className="w-5 h-5" />
                        Calcular BOM e Nesting
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Results Panel */}
              <div className="lg:col-span-2">
                {!bom && !nestingResult ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
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
          </>
        )}

        {/* Tab: Clientes */}
        {activeTab === 'clientes' && (
          <ClienteManager />
        )}

        {/* Tab: Ordens */}
        {activeTab === 'ordens' && (
          <div className="space-y-6">
            {bom ? (
              <OrdemProducaoGenerator
                bom={bom}
                mesaConfig={{
                  comprimento: dimensions.comprimento,
                  largura: dimensions.largura,
                  altura: dimensions.altura,
                  material: material,
                  espessura: espessuraChapa
                }}
              />
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum BOM Calculado
                </h3>
                <p className="text-gray-600 mb-4">
                  Primeiro calcule um BOM na aba "Produção" para gerar ordens
                </p>
                <button
                  onClick={() => setActiveTab('producao')}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  Ir para Produção
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
