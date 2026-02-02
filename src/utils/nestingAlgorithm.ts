// ==========================================================
// NESTING ALGORITHM - 2D BIN PACKING
// ==========================================================

import type { Peca } from './bomCalculator';

export interface PlacedRect {
  x: number;
  y: number;
  w: number;
  h: number;
  desc: string;
  rotated: boolean;
}

export interface NestingResult {
  placedRects: PlacedRect[];
  efficiency: number;
  usedArea: number;
  totalArea: number;
  algorithm: string;
}

interface SkylineSegment {
  x: number;
  y: number;
  w: number;
}

// ==========================================================
// SKYLINE ALGORITHM (Bottom-Left with Minimum Waste Fit)
// ==========================================================
class SkylinePacker {
  private binWidth: number;
  private binHeight: number;
  private skyline: SkylineSegment[];
  private placedRects: PlacedRect[];
  private allowRotation: boolean;

  constructor(binWidth: number, binHeight: number, allowRotation = true) {
    this.binWidth = binWidth;
    this.binHeight = binHeight;
    this.allowRotation = allowRotation;
    this.skyline = [{ x: 0, y: 0, w: binWidth }];
    this.placedRects = [];
  }

  pack(pecas: Peca[]): PlacedRect[] {
    // Sort pieces by height (descending) for better packing
    const sortedPecas = [...pecas].sort((a, b) => {
      const areaA = a.w * a.h;
      const areaB = b.w * b.h;
      return areaB - areaA;
    });

    for (const peca of sortedPecas) {
      this.packRect(peca);
    }

    return this.placedRects;
  }

  private packRect(peca: Peca): boolean {
    let bestPosition: { x: number; y: number; segIdx: number; rotated: boolean } | null = null;
    let bestY = Infinity;
    let bestWaste = Infinity;

    // Try both orientations
    const orientations = this.allowRotation
      ? [
          { w: peca.w, h: peca.h, rotated: false },
          { w: peca.h, h: peca.w, rotated: true },
        ]
      : [{ w: peca.w, h: peca.h, rotated: false }];

    for (const orientation of orientations) {
      for (let i = 0; i < this.skyline.length; i++) {
        const position = this.findPosition(i, orientation.w, orientation.h);
        
        if (position) {
          const waste = this.calculateWaste(position.x, position.y, orientation.w, orientation.h);
          
          // Prefer lower Y position, then less waste
          if (position.y < bestY || (position.y === bestY && waste < bestWaste)) {
            bestY = position.y;
            bestWaste = waste;
            bestPosition = {
              x: position.x,
              y: position.y,
              segIdx: i,
              rotated: orientation.rotated,
            };
          }
        }
      }
    }

    if (bestPosition) {
      const w = bestPosition.rotated ? peca.h : peca.w;
      const h = bestPosition.rotated ? peca.w : peca.h;

      this.placedRects.push({
        x: bestPosition.x,
        y: bestPosition.y,
        w: w,
        h: h,
        desc: peca.desc,
        rotated: bestPosition.rotated,
      });

      this.updateSkyline(bestPosition.x, bestPosition.y, w, h);
      return true;
    }

    return false;
  }

  private findPosition(
    segIdx: number,
    rectW: number,
    rectH: number
  ): { x: number; y: number } | null {
    const seg = this.skyline[segIdx];
    
    // Check if rectangle fits at this segment
    let x = seg.x;
    let y = seg.y;
    let width = 0;
    
    // Find the maximum y in the range [x, x + rectW)
    for (let i = segIdx; i < this.skyline.length && width < rectW; i++) {
      y = Math.max(y, this.skyline[i].y);
      width += this.skyline[i].w;
    }

    // Check bounds
    if (x + rectW > this.binWidth || y + rectH > this.binHeight) {
      return null;
    }

    return { x, y };
  }

  private calculateWaste(x: number, y: number, w: number, h: number): number {
    let waste = 0;
    
    // Calculate area wasted below the rectangle
    for (const seg of this.skyline) {
      if (seg.x >= x + w) break;
      if (seg.x + seg.w <= x) continue;
      
      const overlapX = Math.max(0, Math.min(seg.x + seg.w, x + w) - Math.max(seg.x, x));
      const overlapY = Math.max(0, y - seg.y);
      waste += overlapX * overlapY;
    }
    
    return waste;
  }

  private updateSkyline(x: number, y: number, w: number, h: number): void {
    const newSkyline: SkylineSegment[] = [];
    const rectRight = x + w;
    const rectTop = y + h;

    // Add segments before the rectangle
    for (const seg of this.skyline) {
      if (seg.x + seg.w <= x) {
        newSkyline.push(seg);
      }
    }

    // Add new segment on top of the rectangle
    newSkyline.push({ x, y: rectTop, w });

    // Add segments after the rectangle
    for (const seg of this.skyline) {
      if (seg.x >= rectRight) {
        newSkyline.push(seg);
      } else if (seg.x + seg.w > rectRight) {
        // Partial overlap
        const remainingW = seg.x + seg.w - rectRight;
        newSkyline.push({ x: rectRight, y: seg.y, w: remainingW });
      }
    }

    // Merge adjacent segments with same height
    this.skyline = this.mergeSkyline(newSkyline);
  }

  private mergeSkyline(skyline: SkylineSegment[]): SkylineSegment[] {
    if (skyline.length === 0) return skyline;

    const merged: SkylineSegment[] = [skyline[0]];

    for (let i = 1; i < skyline.length; i++) {
      const last = merged[merged.length - 1];
      const current = skyline[i];

      if (last.y === current.y && last.x + last.w === current.x) {
        last.w += current.w;
      } else {
        merged.push(current);
      }
    }

    return merged;
  }
}

// ==========================================================
// GUILLOTINE ALGORITHM (Best Short Side Fit with MAXAS split)
// ==========================================================
class GuillotinePacker {
  private binWidth: number;
  private binHeight: number;
  private freeRects: Array<{ x: number; y: number; w: number; h: number }>;
  private placedRects: PlacedRect[];
  private allowRotation: boolean;

  constructor(binWidth: number, binHeight: number, allowRotation = true) {
    this.binWidth = binWidth;
    this.binHeight = binHeight;
    this.allowRotation = allowRotation;
    this.freeRects = [{ x: 0, y: 0, w: binWidth, h: binHeight }];
    this.placedRects = [];
  }

  pack(pecas: Peca[]): PlacedRect[] {
    const sortedPecas = [...pecas].sort((a, b) => {
      const areaA = a.w * a.h;
      const areaB = b.w * b.h;
      return areaB - areaA;
    });

    for (const peca of sortedPecas) {
      this.packRect(peca);
    }

    return this.placedRects;
  }

  private packRect(peca: Peca): boolean {
    let bestRect: { x: number; y: number; w: number; h: number; rotated: boolean } | null = null;
    let bestShortSideFit = Infinity;
    let bestRectIndex = -1;

    const orientations = this.allowRotation
      ? [
          { w: peca.w, h: peca.h, rotated: false },
          { w: peca.h, h: peca.w, rotated: true },
        ]
      : [{ w: peca.w, h: peca.h, rotated: false }];

    for (const orientation of orientations) {
      for (let i = 0; i < this.freeRects.length; i++) {
        const rect = this.freeRects[i];

        if (orientation.w <= rect.w && orientation.h <= rect.h) {
          const leftoverHoriz = rect.w - orientation.w;
          const leftoverVert = rect.h - orientation.h;
          const shortSideFit = Math.min(leftoverHoriz, leftoverVert);

          if (shortSideFit < bestShortSideFit) {
            bestRect = {
              x: rect.x,
              y: rect.y,
              w: orientation.w,
              h: orientation.h,
              rotated: orientation.rotated,
            };
            bestShortSideFit = shortSideFit;
            bestRectIndex = i;
          }
        }
      }
    }

    if (bestRect && bestRectIndex !== -1) {
      this.placedRects.push({
        x: bestRect.x,
        y: bestRect.y,
        w: bestRect.w,
        h: bestRect.h,
        desc: peca.desc,
        rotated: bestRect.rotated,
      });

      this.splitFreeRect(bestRectIndex, bestRect);
      return true;
    }

    return false;
  }

  private splitFreeRect(
    index: number,
    placed: { x: number; y: number; w: number; h: number }
  ): void {
    const freeRect = this.freeRects[index];
    this.freeRects.splice(index, 1);

    // MAXAS split: Maximize the smaller area
    const remainW = freeRect.w - placed.w;
    const remainH = freeRect.h - placed.h;

    if (remainW > 0 && remainH > 0) {
      // Both splits are possible
      const horizSplit = remainW * freeRect.h;
      const vertSplit = freeRect.w * remainH;

      if (horizSplit > vertSplit) {
        // Horizontal split
        this.freeRects.push({
          x: freeRect.x + placed.w,
          y: freeRect.y,
          w: remainW,
          h: freeRect.h,
        });
        this.freeRects.push({
          x: freeRect.x,
          y: freeRect.y + placed.h,
          w: placed.w,
          h: remainH,
        });
      } else {
        // Vertical split
        this.freeRects.push({
          x: freeRect.x + placed.w,
          y: freeRect.y,
          w: remainW,
          h: placed.h,
        });
        this.freeRects.push({
          x: freeRect.x,
          y: freeRect.y + placed.h,
          w: freeRect.w,
          h: remainH,
        });
      }
    } else if (remainW > 0) {
      this.freeRects.push({
        x: freeRect.x + placed.w,
        y: freeRect.y,
        w: remainW,
        h: freeRect.h,
      });
    } else if (remainH > 0) {
      this.freeRects.push({
        x: freeRect.x,
        y: freeRect.y + placed.h,
        w: freeRect.w,
        h: remainH,
      });
    }
  }
}

// ==========================================================
// MAIN NESTING EXECUTOR
// ==========================================================
export function executarNesting(
  pecas: Peca[],
  binWidth: number,
  binHeight: number
): NestingResult {
  const algorithms = [
    { name: 'Skyline MWF', packer: new SkylinePacker(binWidth, binHeight) },
    { name: 'Guillotine BSSF', packer: new GuillotinePacker(binWidth, binHeight) },
  ];

  let bestResult: NestingResult | null = null;

  for (const algo of algorithms) {
    const placedRects = algo.packer.pack(pecas);
    const usedArea = placedRects.reduce((sum, rect) => sum + rect.w * rect.h, 0);
    const totalArea = binWidth * binHeight;
    const efficiency = (usedArea / totalArea) * 100;

    const result: NestingResult = {
      placedRects,
      efficiency,
      usedArea,
      totalArea,
      algorithm: algo.name,
    };

    if (!bestResult || efficiency > bestResult.efficiency) {
      bestResult = result;
    }
  }

  return bestResult!;
}
