import { CHAPAS_INDUSTRIAIS } from '../utils/constants';

interface InputPanelProps {
  comprimento: string;
  largura: string;
  altura: string;
  modoChapa: 'AUTO' | 'MANUAL';
  chapaEscolhida: number;
  onComprimentoChange: (value: string) => void;
  onLarguraChange: (value: string) => void;
  onAlturaChange: (value: string) => void;
  onModoChange: (value: 'AUTO' | 'MANUAL') => void;
  onChapaChange: (value: number) => void;
  onCalcular: () => void;
  error: string | null;
}

export function InputPanel({
  comprimento,
  largura,
  altura,
  modoChapa,
  chapaEscolhida,
  onComprimentoChange,
  onLarguraChange,
  onAlturaChange,
  onModoChange,
  onChapaChange,
  onCalcular,
  error,
}: InputPanelProps) {
  return (
    <div className="w-80 bg-[#252526] p-5 overflow-y-auto">
      <h1 className="text-[#4fc3f7] text-xl font-bold mb-6">
        NESTING INDUSTRIAL – MESA INOX
      </h1>

      <div className="mb-8">
        <h2 className="text-[#4fc3f7] text-sm font-bold mb-4">
          DIMENSÕES DA MESA
        </h2>

        <div className="mb-4">
          <label className="text-white text-sm block mb-1">
            Comprimento (frente) mm
          </label>
          <p className="text-[#9e9e9e] text-xs mb-2">Ex: 1300</p>
          <input
            type="text"
            value={comprimento}
            onChange={(e) => onComprimentoChange(e.target.value)}
            className="w-full px-3 py-2 bg-[#3c3c3c] text-white border border-[#555] rounded focus:outline-none focus:border-[#4fc3f7]"
          />
        </div>

        <div className="mb-4">
          <label className="text-white text-sm block mb-1">
            Largura (profundidade) mm
          </label>
          <p className="text-[#9e9e9e] text-xs mb-2">Ex: 700</p>
          <input
            type="text"
            value={largura}
            onChange={(e) => onLarguraChange(e.target.value)}
            className="w-full px-3 py-2 bg-[#3c3c3c] text-white border border-[#555] rounded focus:outline-none focus:border-[#4fc3f7]"
          />
        </div>

        <div className="mb-4">
          <label className="text-white text-sm block mb-1">
            Altura total mm
          </label>
          <p className="text-[#9e9e9e] text-xs mb-2">Ex: 900</p>
          <input
            type="text"
            value={altura}
            onChange={(e) => onAlturaChange(e.target.value)}
            className="w-full px-3 py-2 bg-[#3c3c3c] text-white border border-[#555] rounded focus:outline-none focus:border-[#4fc3f7]"
          />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-[#4fc3f7] text-sm font-bold mb-4">
          SELEÇÃO DE CHAPA
        </h2>

        <div className="mb-3">
          <label className="flex items-center text-white text-sm cursor-pointer">
            <input
              type="radio"
              checked={modoChapa === 'AUTO'}
              onChange={() => onModoChange('AUTO')}
              className="mr-2"
            />
            Automático (melhor aproveitamento)
          </label>
        </div>

        <div className="mb-3">
          <label className="flex items-center text-white text-sm cursor-pointer">
            <input
              type="radio"
              checked={modoChapa === 'MANUAL'}
              onChange={() => onModoChange('MANUAL')}
              className="mr-2"
            />
            Escolher manualmente
          </label>
        </div>

        <select
          value={chapaEscolhida}
          onChange={(e) => onChapaChange(Number(e.target.value))}
          disabled={modoChapa === 'AUTO'}
          className="w-full px-3 py-2 bg-[#3c3c3c] text-white border border-[#555] rounded focus:outline-none focus:border-[#4fc3f7] disabled:opacity-50"
        >
          {CHAPAS_INDUSTRIAIS.map((chapa, index) => (
            <option key={index} value={index}>
              {chapa.nome}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-500 rounded text-red-200 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={onCalcular}
        className="w-full py-3 bg-[#4fc3f7] text-black font-bold text-base rounded hover:bg-[#3fb3e7] transition-colors"
      >
        ▶ CALCULAR NESTING
      </button>
    </div>
  );
}
