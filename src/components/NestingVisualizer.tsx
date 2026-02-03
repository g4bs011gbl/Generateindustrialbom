import React, { useRef, useEffect, useState } from 'react';
import { Maximize2, TrendingUp, Layers, ZoomIn, ZoomOut, Move, RotateCcw } from 'lucide-react';
import type { NestingResult } from '../utils/nestingAlgorithm';

interface NestingVisualizerProps {
  result: NestingResult;
  sheet: { name: string; width: number; height: number };
}

export function NestingVisualizer({ result, sheet }: NestingVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prev) => Math.max(0.5, Math.min(3, prev * delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - lastMousePos.x;
    const dy = e.clientY - lastMousePos.y;
    setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(3, prev * 1.2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.5, prev / 1.2));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const maxWidth = 800;
    const maxHeight = 600;
    const baseScale = Math.min(
      maxWidth / sheet.width,
      maxHeight / sheet.height
    );

    canvas.width = sheet.width * baseScale;
    canvas.height = sheet.height * baseScale;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw sheet border
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2 / zoom;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Fill sheet background
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Define colors for different piece types
    const colors: Record<string, string> = {
      'TAMPO (BLANK)': '#3b82f6',
      'TAMPO COM ESPELHO (BLANK)': '#3b82f6',
      'REFORÇO FRONTAL': '#f59e0b',
      'REFORÇO CENTRAL INFERIOR': '#10b981',
      'REFORÇO TRASEIRO CENTRAL': '#ef4444',
      'REFORÇO TRASEIRO LATERAL ESQ': '#8b5cf6',
      'REFORÇO TRASEIRO LATERAL DIR': '#ec4899',
      'CASQUILHO': '#6366f1',
      'PRATELEIRA': '#06b6d4',
      'REFORÇO PRATELEIRA': '#14b8a6',
    };

    // Draw placed rectangles
    result.placedRects.forEach((rect, index) => {
      const x = rect.x * baseScale;
      const y = rect.y * baseScale;
      const w = rect.w * baseScale;
      const h = rect.h * baseScale;

      // Get color based on description
      const baseColor = colors[rect.desc] || '#6b7280';
      
      // Fill rectangle
      ctx.fillStyle = baseColor + '40'; // Add transparency
      ctx.fillRect(x, y, w, h);

      // Draw border
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = 1.5 / zoom;
      ctx.strokeRect(x, y, w, h);

      // Draw label
      ctx.fillStyle = '#1f2937';
      ctx.font = `${10 / zoom}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const label = `${rect.desc}${rect.rotated ? ' (R)' : ''}`;
      const dimensions = `${rect.w.toFixed(0)}×${rect.h.toFixed(0)}`;
      
      // Draw label with background
      const labelY = y + h / 2 - 6;
      const dimY = y + h / 2 + 6;
      
      if (w > 60 && h > 30) {
        // White background for text readability
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        const textWidth = Math.max(
          ctx.measureText(label).width,
          ctx.measureText(dimensions).width
        );
        ctx.fillRect(
          x + w / 2 - textWidth / 2 - 4,
          y + h / 2 - 14,
          textWidth + 8,
          28
        );

        // Draw text
        ctx.fillStyle = '#1f2937';
        ctx.fillText(label, x + w / 2, labelY);
        ctx.fillStyle = '#6b7280';
        ctx.font = `${9 / zoom}px sans-serif`;
        ctx.fillText(dimensions, x + w / 2, dimY);
      }
    });

    // Draw dimensions
    ctx.fillStyle = '#1f2937';
    ctx.font = `bold ${12 / zoom}px sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(
      `${sheet.width} × ${sheet.height} mm`,
      canvas.width - 10,
      10
    );

    ctx.restore();

  }, [result, sheet, zoom, pan]);

  const wastePercentage = 100 - result.efficiency;
  const placedCount = result.placedRects.length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Maximize2 className="w-5 h-5 text-purple-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          Resultado do Nesting
        </h2>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-900">
              Eficiência
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-900">
            {result.efficiency.toFixed(1)}%
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-green-900">
              Peças Alocadas
            </span>
          </div>
          <p className="text-2xl font-bold text-green-900">
            {placedCount}
          </p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
          <div className="flex items-center gap-2 mb-1">
            <Maximize2 className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-medium text-orange-900">
              Desperdício
            </span>
          </div>
          <p className="text-2xl font-bold text-orange-900">
            {wastePercentage.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Algorithm info */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Algoritmo:</span> {result.algorithm}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Chapa:</span> {sheet.name} mm
        </p>
      </div>

      {/* Canvas Controls */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          title="Aumentar zoom"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          title="Diminuir zoom"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          title="Resetar visualização"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 ml-auto">
          <Move className="w-4 h-4 text-gray-500" />
          <span className="text-xs text-gray-600">
            Arraste para mover | Scroll para zoom
          </span>
        </div>
        <span className="text-sm font-medium text-gray-700 ml-2">
          {(zoom * 100).toFixed(0)}%
        </span>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="border border-gray-200 rounded-md overflow-hidden bg-white cursor-move"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-auto"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Legenda:</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-xs text-gray-600">Tampo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-xs text-gray-600">Reforço Inferior</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-xs text-gray-600">Reforço Frontal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-xs text-gray-600">Reforço Traseiro</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          (R) indica peça rotacionada 90°
        </p>
      </div>

      {/* Detailed parts list */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Peças Alocadas:
        </h3>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {result.placedRects.map((rect, idx) => (
            <div
              key={idx}
              className="text-xs text-gray-600 flex justify-between items-center py-1 px-2 hover:bg-gray-50 rounded"
            >
              <span>
                {idx + 1}. {rect.desc}
                {rect.rotated && ' (rotacionada)'}
              </span>
              <span className="text-gray-500">
                {rect.w.toFixed(0)} × {rect.h.toFixed(0)} mm
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}