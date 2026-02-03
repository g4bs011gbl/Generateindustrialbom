// ==========================================================
// APLICATIVO INDUSTRIAL DE BANCADAS INOX (NESTING + BOM)
// Sistema profissional para chão de fábrica
// ==========================================================

export interface BOMItem {
  desc: string;
  qtd: number;
  w: number;
  h: number;
  espessura: number;
  material: string;
  processo: string;
}

export interface Pes {
  qtd: number;
  tubo: number;
}

export interface Contraventamentos {
  lateral: number;
  traseiro: number;
  qtd: number;
}

export interface Casquilhos {
  qtd: number;
  dimensao: string;
  espessura: number;
}

export interface BOMResult {
  bom: BOMItem[];
  pes: Pes;
  contraventamentos: Contraventamentos | null;
  casquilhos: Casquilhos;
  prateleira: BOMItem | null;
}

export type TipoMesa = 'simples' | 'contraventada' | 'prateleira';
export type MaterialInox = '430' | '304' | '316';

export interface MesaConfig {
  c: number;  // comprimento
  l: number;  // largura
  a: number;  // altura
  tipo_mesa: TipoMesa;
  espelho_traseiro: boolean;
  espelho_lateral_esq: boolean;
  espelho_lateral_dir: boolean;
  material: MaterialInox;
  espessura_chapa: number;
}

// ========== CONSTANTES INDUSTRIAIS (NUNCA ALTERAR) ==========
const DENSIDADE_INOX = 7.93; // g/cm³

const ABA = 9.122766;
const DOBRA = 23.245534;
const RAIO = 38.245534;

const DOBRA_ESPELHO = [82.924617, 32.515269, 12.351895];

const SAPATA_PE = 45;
const CASQUILHO_ALTURA = 27;

// ==========================================================
// VALIDAÇÃO DE CONFIGURAÇÃO
// ==========================================================
export function validarConfiguracao(config: MesaConfig): { valido: boolean; erro?: string } {
  // ❌ REGRA CRÍTICA: Nunca pode existir mesa contraventada com prateleira
  if (config.tipo_mesa === 'contraventada' && config.tipo_mesa === 'prateleira') {
    return {
      valido: false,
      erro: 'Mesa contraventada com prateleira não é permitida'
    };
  }

  // Validar dimensões mínimas
  if (config.c < 500 || config.c > 5000) {
    return {
      valido: false,
      erro: 'Comprimento deve estar entre 500mm e 5000mm'
    };
  }

  if (config.l < 400 || config.l > 2000) {
    return {
      valido: false,
      erro: 'Largura deve estar entre 400mm e 2000mm'
    };
  }

  if (config.a < 700 || config.a > 1200) {
    return {
      valido: false,
      erro: 'Altura deve estar entre 700mm e 1200mm'
    };
  }

  return { valido: true };
}

// ==========================================================
// FUNÇÃO PRINCIPAL - GERAR BOM INDUSTRIAL
// ==========================================================
export function gerarBOMIndustrial(config: MesaConfig): BOMResult {
  // Validar configuração
  const validacao = validarConfiguracao(config);
  if (!validacao.valido) {
    throw new Error(`Configuração inválida: ${validacao.erro}`);
  }

  const { c, l, a, tipo_mesa, espelho_traseiro, espelho_lateral_esq, espelho_lateral_dir, material, espessura_chapa } = config;
  
  const bom: BOMItem[] = [];
  
  // ========== 1️⃣ TAMPO ==========
  const temEspelho = espelho_traseiro || espelho_lateral_esq || espelho_lateral_dir;
  
  let tampo: BOMItem;
  
  if (!temEspelho) {
    // TAMPO SEM ESPELHO
    const BLANK_X = ABA + DOBRA + RAIO + c + RAIO + DOBRA + ABA;
    const BLANK_Y = ABA + DOBRA + RAIO + l + RAIO + DOBRA + ABA;
    
    tampo = {
      desc: "TAMPO (BLANK)",
      qtd: 1,
      w: Math.round(BLANK_X * 10) / 10,
      h: Math.round(BLANK_Y * 10) / 10,
      espessura: espessura_chapa,
      material: material,
      processo: "LASER"
    };
  } else {
    // TAMPO COM ESPELHO
    // ❌ Ignorar dobras padrão 40×25×10
    // ✅ Usar DOBRA_ESPELHO
    
    const ESP_TRAS = espelho_traseiro ? c - 2 : 0;
    const ESP_LAT = (espelho_lateral_esq || espelho_lateral_dir) ? l - 2 : 0;
    
    const soma_dobras_espelho = DOBRA_ESPELHO[0] + DOBRA_ESPELHO[1] + DOBRA_ESPELHO[2];
    
    // BLANK FINAL COM ESPELHO
    const BLANK_X = Math.max(
      c + soma_dobras_espelho,
      ESP_LAT + soma_dobras_espelho
    );
    
    const BLANK_Y = Math.max(
      l + soma_dobras_espelho,
      ESP_TRAS + soma_dobras_espelho
    );
    
    tampo = {
      desc: "TAMPO COM ESPELHO (BLANK)",
      qtd: 1,
      w: Math.round(BLANK_X * 10) / 10,
      h: Math.round(BLANK_Y * 10) / 10,
      espessura: espessura_chapa,
      material: material,
      processo: "LASER"
    };
  }
  
  bom.push(tampo);
  
  // ========== 2️⃣ REFORÇO FRONTAL (SEMPRE EXISTE) ==========
  const reforcoFrontal: BOMItem = {
    desc: "REFORÇO FRONTAL",
    qtd: 1,
    w: Math.round((c - 130) * 10) / 10,
    h: 113,
    espessura: espessura_chapa,
    material: material,
    processo: "GUILHOTINA"
  };
  bom.push(reforcoFrontal);
  
  // ========== 3️⃣ REFORÇO CENTRAL INFERIOR (SEMPRE EXISTE) ==========
  const reforcoCentralInferior: BOMItem = {
    desc: "REFORÇO CENTRAL INFERIOR",
    qtd: 1,
    w: Math.round((l - 50) * 10) / 10,
    h: 130.3,
    espessura: espessura_chapa,
    material: material,
    processo: "GUILHOTINA"
  };
  bom.push(reforcoCentralInferior);
  
  // ========== 4️⃣ REFORÇO TRASEIRO CENTRAL ==========
  if (espelho_traseiro) {
    const reforcoTraseiroCentral: BOMItem = {
      desc: "REFORÇO TRASEIRO CENTRAL",
      qtd: 1,
      w: Math.round((c - 16) * 10) / 10,
      h: 104.28,
      espessura: espessura_chapa,
      material: material,
      processo: "GUILHOTINA"
    };
    bom.push(reforcoTraseiroCentral);
  }
  
  // ========== 5️⃣ REFORÇO TRASEIRO LATERAL ==========
  // 🔥 REGRA CRÍTICA: espelho lateral SEMPRE gera reforço traseiro
  if (espelho_lateral_esq) {
    const reforcoTraseiroLateralEsq: BOMItem = {
      desc: "REFORÇO TRASEIRO LATERAL ESQ",
      qtd: 1,
      w: Math.round((l - 41) * 10) / 10,
      h: 104.28,
      espessura: espessura_chapa,
      material: material,
      processo: "GUILHOTINA"
    };
    bom.push(reforcoTraseiroLateralEsq);
  }
  
  if (espelho_lateral_dir) {
    const reforcoTraseiroLateralDir: BOMItem = {
      desc: "REFORÇO TRASEIRO LATERAL DIR",
      qtd: 1,
      w: Math.round((l - 41) * 10) / 10,
      h: 104.28,
      espessura: espessura_chapa,
      material: material,
      processo: "GUILHOTINA"
    };
    bom.push(reforcoTraseiroLateralDir);
  }
  
  // ========== 6️⃣ PRATELEIRA (APENAS SE tipo_mesa == "prateleira") ==========
  let prateleira: BOMItem | null = null;
  
  if (tipo_mesa === 'prateleira') {
    // Prateleira principal
    prateleira = {
      desc: "PRATELEIRA",
      qtd: 1,
      w: Math.round((c - 40) * 10) / 10,
      h: Math.round((l - 40) * 10) / 10,
      espessura: espessura_chapa,
      material: material,
      processo: "LASER"
    };
    bom.push(prateleira);
    
    // Reforços da prateleira
    const reforcoPrateleira: BOMItem = {
      desc: "REFORÇO PRATELEIRA",
      qtd: 2,
      w: Math.round((l - 60) * 10) / 10,
      h: 90,
      espessura: espessura_chapa,
      material: material,
      processo: "GUILHOTINA"
    };
    bom.push(reforcoPrateleira);
  }
  
  // ========== 7️⃣ CASQUILHOS ==========
  const casquilhos: Casquilhos = {
    qtd: 4,
    dimensao: "61 x 61",
    espessura: 2.0
  };
  
  // ⚠️ Casquilhos nunca entram no nesting da chapa principal
  // ⚠️ Espessura diferente = nesting separado
  const casquilhoItem: BOMItem = {
    desc: "CASQUILHO",
    qtd: 4,
    w: 61,
    h: 61,
    espessura: 2.0,
    material: material,
    processo: "LASER"
  };
  bom.push(casquilhoItem);
  
  // ========== 8️⃣ PÉS (NÃO ENTRAM NO NESTING) ==========
  const tuboPe = Math.round((a - espessura_chapa - SAPATA_PE - CASQUILHO_ALTURA) * 10) / 10;
  
  const pes: Pes = {
    qtd: 4,
    tubo: tuboPe
  };
  
  // ========== 9️⃣ CONTRAVENTAMENTOS (NÃO ENTRAM NO NESTING) ==========
  let contraventamentos: Contraventamentos | null = null;
  
  // ❌ Nunca gerar contraventamento se existir prateleira
  if (tipo_mesa === 'contraventada') {
    contraventamentos = {
      lateral: Math.round((l - 130) * 10) / 10,
      traseiro: 0,
      qtd: 3
    };
  } else if (tipo_mesa === 'simples') {
    // Mesa simples não tem contraventamento
    contraventamentos = null;
  }
  
  return { bom, pes, contraventamentos, casquilhos, prateleira };
}

// ==========================================================
// EXPANDIR PEÇAS PARA NESTING
// ==========================================================
export interface Peca {
  desc: string;
  w: number;
  h: number;
  espessura: number;
  material: string;
}

export function expandirPecas(bom: BOMItem[]): Peca[] {
  const pecas: Peca[] = [];
  
  for (const item of bom) {
    // ⚠️ Casquilhos não entram no nesting da chapa principal
    if (item.desc === 'CASQUILHO') continue;
    
    for (let i = 0; i < item.qtd; i++) {
      pecas.push({
        desc: item.desc,
        w: item.w,
        h: item.h,
        espessura: item.espessura,
        material: item.material,
      });
    }
  }
  
  return pecas;
}

// ==========================================================
// AGRUPAR PEÇAS POR MATERIAL + ESPESSURA
// ==========================================================
export interface GrupoPecas {
  material: string;
  espessura: number;
  pecas: Peca[];
  chave: string;
}

export function agruparPecas(pecas: Peca[]): GrupoPecas[] {
  const grupos = new Map<string, GrupoPecas>();
  
  for (const peca of pecas) {
    const chave = `${peca.material}_${peca.espessura}`;
    
    if (!grupos.has(chave)) {
      grupos.set(chave, {
        material: peca.material,
        espessura: peca.espessura,
        pecas: [],
        chave
      });
    }
    
    grupos.get(chave)!.pecas.push(peca);
  }
  
  return Array.from(grupos.values());
}

// ==========================================================
// FUNÇÃO AUXILIAR - VERSÃO SIMPLIFICADA (RETROCOMPATIBILIDADE)
// ==========================================================
export function gerarBOMIndustrialSimples(
  c: number,
  l: number,
  a: number
): BOMResult {
  return gerarBOMIndustrial({
    c,
    l,
    a,
    tipo_mesa: 'simples',
    espelho_traseiro: false,
    espelho_lateral_esq: false,
    espelho_lateral_dir: false,
    material: '304',
    espessura_chapa: 0.8
  });
}

// ==========================================================
// CALCULAR PESO DO MATERIAL
// ==========================================================
export function calcularPeso(bom: BOMItem[]): number {
  let pesoTotal = 0;
  
  for (const item of bom) {
    // Área em mm²
    const areaMm2 = item.w * item.h * item.qtd;
    
    // Converter para cm²
    const areaCm2 = areaMm2 / 100;
    
    // Volume em cm³
    const volumeCm3 = (areaCm2 * item.espessura) / 10;
    
    // Peso em kg
    const pesoKg = (volumeCm3 * DENSIDADE_INOX) / 1000;
    
    pesoTotal += pesoKg;
  }
  
  return pesoTotal;
}
