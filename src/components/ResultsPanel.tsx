import { BomItem, Pes, Contraventamentos, NestingResult } from '../App';

interface ResultsPanelProps {
  bom: BomItem[] | null;
  pes: Pes | null;
  contraventamentos: Contraventamentos | null;
  nestingResult: NestingResult | null;
}

export function ResultsPanel({
  bom,
  pes,
  contraventamentos,
  nestingResult,
}: ResultsPanelProps) {
  if (!bom || !pes || !contraventamentos || !nestingResult) {
    return (
      <div className="w-96 bg-[#252526] p-5 overflow-y-auto">
        <h2 className="text-[#4fc3f7] text-base font-bold mb-4">
          RELATÓRIO INDUSTRIAL
        </h2>
        <div className="text-[#9e9e9e] text-sm">
          Aguardando cálculo...
        </div>
      </div>
    );
  }

  return (
    <div className="w-96 bg-[#252526] p-5 overflow-y-auto">
      <h2 className="text-[#4fc3f7] text-base font-bold mb-4">
        RELATÓRIO INDUSTRIAL
      </h2>

      <div className="bg-[#1e1e1e] p-4 rounded font-mono text-xs text-white space-y-4">
        {/* Chapa e Eficiência */}
        <div className="border-b border-[#4fc3f7] pb-3">
          <div className="text-[#4fc3f7] font-bold mb-1">CHAPA SELECIONADA</div>
          <div>{nestingResult.nome}</div>
          <div className="mt-2">
            <span className="text-[#4fc3f7] font-bold">EFICIÊNCIA: </span>
            <span className="text-[#66ff66] font-bold">
              {nestingResult.eff.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* BOM */}
        <div className="border-b border-[#4fc3f7] pb-3">
          <div className="text-[#4fc3f7] font-bold mb-2">📋 BOM (Bill of Materials)</div>
          {bom.map((item, idx) => (
            <div key={idx} className="mb-2 pl-2">
              <div className="text-[#ffcc66]">{item.desc}</div>
              <div className="text-[#aaa] ml-2">
                {item.qtd} x {item.w} x {item.h} x 0,8 mm
              </div>
            </div>
          ))}
        </div>

        {/* Pés */}
        <div className="border-b border-[#4fc3f7] pb-3">
          <div className="text-[#4fc3f7] font-bold mb-2">🦵 PÉS</div>
          <div className="pl-2">
            <div className="text-[#aaa]">
              {pes.qtd} x Tubo {pes.tubo} mm
            </div>
            <div className="text-[#888] text-xs mt-1">
              (Sapata: 45mm + Casquilho: 27mm)
            </div>
          </div>
        </div>

        {/* Contraventamentos */}
        <div>
          <div className="text-[#4fc3f7] font-bold mb-2">🔩 CONTRAVENTAMENTOS</div>
          <div className="pl-2 space-y-1">
            <div className="text-[#aaa]">
              Lateral: 2 x {contraventamentos.lateral} mm
            </div>
            <div className="text-[#aaa]">
              Traseiro: 1 x {contraventamentos.traseiro} mm
            </div>
          </div>
        </div>

        {/* Resumo de Área */}
        <div className="border-t border-[#555] pt-3 mt-4">
          <div className="text-[#888] text-xs">
            <div>Área da chapa: {(nestingResult.C * nestingResult.L / 1000000).toFixed(2)} m²</div>
            <div>
              Área utilizada: {(
                nestingResult.pos.reduce((sum, p) => sum + p.w * p.h, 0) / 1000000
              ).toFixed(2)} m²
            </div>
            <div>
              Desperdício: {(
                (nestingResult.C * nestingResult.L - 
                  nestingResult.pos.reduce((sum, p) => sum + p.w * p.h, 0)) / 1000000
              ).toFixed(2)} m²
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
