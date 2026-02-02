import { Peca, NestingResult } from '../App';
import { Chapa } from './constants';

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
  placed: boolean;
}

// Implementação simplificada de algoritmo de nesting
// Usa uma abordagem gulosa de First Fit Decreasing Height
function tryPackRectangles(
  pecas: Peca[],
  binWidth: number,
  binHeight: number,
  allowRotation: boolean
): Array<{ desc: string; x: number; y: number; w: number; h: number }> | null {
  // Ordena peças por altura (descendente)
  const sorted = pecas
    .map((p, idx) => ({ ...p, idx }))
    .sort((a, b) => b.h - a.h);

  const placed: Array<{
    desc: string;
    x: number;
    y: number;
    w: number;
    h: number;
  }> = [];

  // Skyline algorithm simplificado
  const skyline: Array<{ x: number; y: number; w: number }> = [
    { x: 0, y: 0, w: binWidth },
  ];

  for (const peca of sorted) {
    let bestPos: { x: number; y: number; w: number; h: number; skylineIdx: number } | null = null;
    let bestY = Infinity;

    // Tenta colocar a peça em cada posição do skyline
    for (let i = 0; i < skyline.length; i++) {
      const seg = skyline[i];

      // Tenta orientação normal
      if (seg.w >= peca.w && seg.y + peca.h <= binHeight && seg.y < bestY) {
        bestPos = {
          x: seg.x,
          y: seg.y,
          w: peca.w,
          h: peca.h,
          skylineIdx: i,
        };
        bestY = seg.y;
      }

      // Tenta rotação se permitido
      if (
        allowRotation &&
        seg.w >= peca.h &&
        seg.y + peca.w <= binHeight &&
        seg.y < bestY
      ) {
        bestPos = {
          x: seg.x,
          y: seg.y,
          w: peca.h,
          h: peca.w,
          skylineIdx: i,
        };
        bestY = seg.y;
      }
    }

    if (!bestPos) {
      return null; // Não conseguiu colocar esta peça
    }

    // Adiciona peça
    placed.push({
      desc: peca.desc,
      x: bestPos.x,
      y: bestPos.y,
      w: bestPos.w,
      h: bestPos.h,
    });

    // Atualiza skyline
    updateSkyline(skyline, bestPos);
  }

  return placed;
}

function updateSkyline(
  skyline: Array<{ x: number; y: number; w: number }>,
  rect: { x: number; y: number; w: number; h: number; skylineIdx: number }
) {
  const newY = rect.y + rect.h;
  const newSegments: Array<{ x: number; y: number; w: number }> = [];

  let i = 0;
  // Segmentos antes do retângulo
  while (i < skyline.length && skyline[i].x + skyline[i].w <= rect.x) {
    newSegments.push(skyline[i]);
    i++;
  }

  // Adiciona novo segmento para o topo do retângulo
  newSegments.push({
    x: rect.x,
    y: newY,
    w: rect.w,
  });

  // Pula segmentos cobertos pelo retângulo
  while (i < skyline.length && skyline[i].x < rect.x + rect.w) {
    const seg = skyline[i];
    // Se o segmento se estende além do retângulo, mantém a parte que sobra
    if (seg.x + seg.w > rect.x + rect.w) {
      newSegments.push({
        x: rect.x + rect.w,
        y: seg.y,
        w: seg.x + seg.w - (rect.x + rect.w),
      });
    }
    i++;
  }

  // Segmentos após o retângulo
  while (i < skyline.length) {
    newSegments.push(skyline[i]);
    i++;
  }

  // Merge segmentos adjacentes com mesma altura
  skyline.length = 0;
  for (let j = 0; j < newSegments.length; j++) {
    if (
      skyline.length > 0 &&
      skyline[skyline.length - 1].y === newSegments[j].y &&
      skyline[skyline.length - 1].x + skyline[skyline.length - 1].w === newSegments[j].x
    ) {
      skyline[skyline.length - 1].w += newSegments[j].w;
    } else {
      skyline.push(newSegments[j]);
    }
  }
}

export function executarNesting(
  pecas: Peca[],
  chapas: Chapa[]
): NestingResult | null {
  let melhor: NestingResult | null = null;
  let melhorEff = 0;

  const rotacoes = [true, false];

  for (const chapa of chapas) {
    for (const allowRotation of rotacoes) {
      const pos = tryPackRectangles(pecas, chapa.C, chapa.L, allowRotation);

      if (pos && pos.length === pecas.length) {
        const areaUsada = pos.reduce((sum, p) => sum + p.w * p.h, 0);
        const eff = (areaUsada / (chapa.C * chapa.L)) * 100;

        if (eff > melhorEff) {
          melhorEff = eff;
          melhor = {
            nome: chapa.nome,
            C: chapa.C,
            L: chapa.L,
            pos,
            eff,
          };
        }
      }
    }
  }

  return melhor;
}
