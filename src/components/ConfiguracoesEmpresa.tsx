import React, { useState, useRef, useEffect } from 'react';
import { Settings, Upload, X, Save, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { setLogoEmpresa, getLogoEmpresa } from '../utils/opPdfExporter';

export function ConfiguracoesEmpresa() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedLogo = getLogoEmpresa();
    if (savedLogo) {
      setLogoPreview(savedLogo);
    }

    const savedNome = localStorage.getItem('nomeEmpresa');
    if (savedNome) {
      setNomeEmpresa(savedNome);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    // Validar tamanho (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setLogoPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (logoPreview) {
      setLogoEmpresa(logoPreview);
      toast.success('Logo salvo com sucesso!');
    }

    if (nomeEmpresa) {
      localStorage.setItem('nomeEmpresa', nomeEmpresa);
      toast.success('Configurações salvas!');
    }

    setShowModal(false);
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    localStorage.removeItem('logoEmpresa');
    toast.info('Logo removido');
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors"
      >
        <Settings className="w-4 h-4" />
        Configurações
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Settings className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Configurações da Empresa
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Nome da Empresa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Empresa
                </label>
                <input
                  type="text"
                  value={nomeEmpresa}
                  onChange={(e) => setNomeEmpresa(e.target.value)}
                  placeholder="Nome da sua empresa"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo da Empresa
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  {logoPreview ? (
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <div className="relative">
                          <img
                            src={logoPreview}
                            alt="Logo Preview"
                            className="max-h-32 rounded-lg shadow-md"
                          />
                          <button
                            onClick={handleRemoveLogo}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            title="Remover logo"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Alterar Logo
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Logo
                      </button>
                      <p className="text-sm text-gray-500 mt-2">
                        PNG, JPG ou SVG (máx. 2MB)
                      </p>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Informações sobre o logo */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  📋 Sobre o logo nas Ordens de Produção
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• O logo aparecerá no cabeçalho das OPs geradas</li>
                  <li>• Recomendamos imagens com fundo transparente</li>
                  <li>• Dimensões ideais: 500x200px (proporção 2.5:1)</li>
                  <li>• Será redimensionado automaticamente no PDF</li>
                </ul>
              </div>

              {/* Preview */}
              {logoPreview && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Preview no PDF
                  </h4>
                  <div className="bg-white border border-gray-300 rounded p-4">
                    <div className="flex items-start justify-between">
                      <img
                        src={logoPreview}
                        alt="Logo Preview"
                        className="h-12"
                      />
                      <div className="text-right">
                        <div className="text-xs text-gray-600">Nº da Ordem de produ.</div>
                        <div className="text-lg font-bold">00001-26</div>
                      </div>
                    </div>
                    <div className="text-center mt-3">
                      <h3 className="text-lg font-bold">ORDEM DE PRODUÇÃO</h3>
                    </div>
                  </div>
                </div>
              )}

              {/* Botões */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Salvar Configurações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
