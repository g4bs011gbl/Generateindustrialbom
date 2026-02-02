import React, { useState } from 'react';
import { Plus, Trash2, Copy, Package } from 'lucide-react';

export interface TableSpec {
  id: string;
  comprimento: number;
  largura: number;
  altura: number;
  quantidade: number;
}

interface MultipleTablesProps {
  onTablesChange: (tables: TableSpec[]) => void;
}

export function MultipleTables({ onTablesChange }: MultipleTablesProps) {
  const [tables, setTables] = useState<TableSpec[]>([
    {
      id: '1',
      comprimento: 1000,
      largura: 700,
      altura: 850,
      quantidade: 1,
    },
  ]);

  const addTable = () => {
    const newTable: TableSpec = {
      id: Date.now().toString(),
      comprimento: 1000,
      largura: 700,
      altura: 850,
      quantidade: 1,
    };
    const updated = [...tables, newTable];
    setTables(updated);
    onTablesChange(updated);
  };

  const removeTable = (id: string) => {
    const updated = tables.filter((t) => t.id !== id);
    setTables(updated);
    onTablesChange(updated);
  };

  const duplicateTable = (table: TableSpec) => {
    const newTable: TableSpec = {
      ...table,
      id: Date.now().toString(),
    };
    const updated = [...tables, newTable];
    setTables(updated);
    onTablesChange(updated);
  };

  const updateTable = (id: string, field: keyof TableSpec, value: number) => {
    const updated = tables.map((t) =>
      t.id === id ? { ...t, [field]: value } : t
    );
    setTables(updated);
    onTablesChange(updated);
  };

  const totalMesas = tables.reduce((sum, t) => sum + t.quantidade, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Múltiplas Mesas
          </h2>
        </div>
        <div className="text-sm text-gray-600">
          Total: <span className="font-semibold text-purple-600">{totalMesas}</span> mesa{totalMesas !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {tables.map((table, index) => (
          <div
            key={table.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">
                Mesa #{index + 1}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => duplicateTable(table)}
                  className="p-1 text-gray-500 hover:text-purple-600 transition-colors"
                  title="Duplicar mesa"
                >
                  <Copy className="w-4 h-4" />
                </button>
                {tables.length > 1 && (
                  <button
                    onClick={() => removeTable(table.id)}
                    className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                    title="Remover mesa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Comprimento (mm)
                </label>
                <input
                  type="number"
                  value={table.comprimento}
                  onChange={(e) =>
                    updateTable(table.id, 'comprimento', Number(e.target.value))
                  }
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="500"
                  max="5000"
                  step="10"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Largura (mm)
                </label>
                <input
                  type="number"
                  value={table.largura}
                  onChange={(e) =>
                    updateTable(table.id, 'largura', Number(e.target.value))
                  }
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="400"
                  max="2000"
                  step="10"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Altura (mm)
                </label>
                <input
                  type="number"
                  value={table.altura}
                  onChange={(e) =>
                    updateTable(table.id, 'altura', Number(e.target.value))
                  }
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="700"
                  max="1200"
                  step="10"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Quantidade
                </label>
                <input
                  type="number"
                  value={table.quantidade}
                  onChange={(e) =>
                    updateTable(table.id, 'quantidade', Number(e.target.value))
                  }
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                  max="100"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addTable}
        className="w-full mt-4 py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Adicionar Nova Mesa
      </button>
    </div>
  );
}
