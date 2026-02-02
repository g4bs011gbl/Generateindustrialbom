import { BomItem, Pes, Contraventamentos, Peca } from "../App";

export function gerarBomIndustrial(
  c: number,
  l: number,
  a: number,
): [BomItem[], Pes, Contraventamentos] {
  const ESP = 0.8;

  // Constantes industriais do desenvolvimento
  const aba = 9.122766;
  const dobra = 23.245534;
  const raio = 38.245534;

  const larguraBlank =
    aba + dobra + raio + l + raio + dobra + aba;
  const comprimentoBlank = aba + dobra + raio + c;

  const tampo: BomItem = {
    desc: "TAMPO (BLANK)",
    qtd: 1,
    w: Math.round(comprimentoBlank * 10) / 10,
    h: Math.round(larguraBlank * 10) / 10,
  };

  // Reforços
  const qtdRefInferior = Math.max(2, Math.ceil(c / 350));

  const reforcoInferior: BomItem = {
    desc: "REFORÇO INFERIOR",
    qtd: qtdRefInferior,
    w: Math.round((l - 54.7) * 10) / 10,
    h: 135.58,
  };

  const reforcoFrontal: BomItem = {
    desc: "REFORÇO FRONTAL",
    qtd: 1,
    w: Math.round((c - 130) * 10) / 10,
    h: 113,
  };

  const reforcoTraseiro: BomItem = {
    desc: "REFORÇO TRASEIRO",
    qtd: 1,
    w: Math.round((c - 22) * 10) / 10,
    h: 104,
  };

  const bom: BomItem[] = [
    tampo,
    reforcoInferior,
    reforcoFrontal,
    reforcoTraseiro,
  ];

  // Pés
  const sapata = 45;
  const casquilho = 27;
  const tuboPe =
    Math.round((a - ESP - sapata - casquilho) * 10) / 10;

  const pes: Pes = {
    qtd: 4,
    tubo: tuboPe,
  };

  const contraventamentos: Contraventamentos = {
    lateral: Math.round((l - 135) * 10) / 10,
    traseiro: Math.round((c - 130) * 10) / 10,
  };

  return [bom, pes, contraventamentos];
}

export function expandirPecas(bom: BomItem[]): Peca[] {
  const pecas: Peca[] = [];
  for (const item of bom) {
    for (let i = 0; i < item.qtd; i++) {
      pecas.push({
        desc: item.desc,
        w: item.w,
        h: item.h,
      });
    }
  }
  return pecas;
}