import { useEffect, useRef } from 'react';
import { NestingResult } from '../App';

interface NestingCanvasProps {
  result: NestingResult | null;
}

export function NestingCanvas({ result }: NestingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !result) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpa canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { C, L, pos } = result;

    // Calcula escala para caber no canvas
    const padding = 60;
    const availableWidth = canvas.width - padding * 2;
    const availableHeight = canvas.height - padding * 2;
    const scale = Math.min(availableWidth / C, availableHeight / L);

    const offsetX = padding;
    const offsetY = padding;

    // Desenha eixos
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.font = '11px monospace';
    ctx.fillStyle = '#666';

    // Eixo Y
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    ctx.lineTo(offsetX, offsetY + L * scale);
    ctx.stroke();
    
    // Seta Y
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    ctx.lineTo(offsetX - 5, offsetY + 10);
    ctx.lineTo(offsetX + 5, offsetY + 10);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillText('Y (mm)', offsetX - 40, offsetY - 10);

    // Eixo X
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY + L * scale);
    ctx.lineTo(offsetX + C * scale, offsetY + L * scale);
    ctx.stroke();
    
    // Seta X
    ctx.beginPath();
    ctx.moveTo(offsetX + C * scale, offsetY + L * scale);
    ctx.lineTo(offsetX + C * scale - 10, offsetY + L * scale - 5);
    ctx.lineTo(offsetX + C * scale - 10, offsetY + L * scale + 5);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillText('X (mm)', offsetX + C * scale + 10, offsetY + L * scale + 5);
    ctx.fillText('(0,0)', offsetX - 30, offsetY + L * scale + 15);

    // Desenha borda da chapa
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(offsetX, offsetY, C * scale, L * scale);

    // Desenha peças
    const colors = ['#4fc3f7', '#64b5f6', '#42a5f5', '#2196f3', '#1e88e5'];
    
    pos.forEach((p, idx) => {
      const x1 = offsetX + p.x * scale;
      const y1 = offsetY + p.y * scale;
      const width = p.w * scale;
      const height = p.h * scale;

      // Retângulo da peça
      ctx.fillStyle = colors[idx % colors.length];
      ctx.fillRect(x1, y1, width, height);
      
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.strokeRect(x1, y1, width, height);

      // Texto com coordenadas
      ctx.fillStyle = '#000';
      ctx.font = '9px monospace';
      const text = `X:${Math.round(p.x)}\nY:${Math.round(p.y)}`;
      const lines = text.split('\n');
      lines.forEach((line, i) => {
        ctx.fillText(line, x1 + 4, y1 + 12 + i * 11);
      });
    });

    // Desenha dimensões da chapa
    ctx.fillStyle = '#333';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`${C} mm`, offsetX + (C * scale) / 2 - 30, offsetY + L * scale + 30);
    
    ctx.save();
    ctx.translate(offsetX - 30, offsetY + (L * scale) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${L} mm`, -30, 0);
    ctx.restore();

  }, [result]);

  if (!result) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-lg">
        Configure as dimensões e clique em "CALCULAR NESTING"
      </div>
    );
  }

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Visualização do Nesting
        </h2>
        <p className="text-gray-600">
          Chapa: {result.nome} | Eficiência: {result.eff.toFixed(1)}%
        </p>
      </div>
      <canvas
        ref={canvasRef}
        width={1000}
        height={700}
        className="border border-gray-300 bg-white"
      />
    </div>
  );
}
