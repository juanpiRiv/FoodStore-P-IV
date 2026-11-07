import { flexRender } from '@tanstack/react-table'
import type { Table } from '@tanstack/react-table'
import { Button } from '../ui/Button.tsx'

interface TablaDatosProps<T> {
  tabla: Table<T>
}

/** Tabla genérica sobre una instancia de TanStack Table, con paginación del lado del cliente. */
export function TablaDatos<T>({ tabla }: TablaDatosProps<T>) {
  const { pageIndex } = tabla.getState().pagination
  const totalPaginas = tabla.getPageCount()
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            {tabla.getHeaderGroups().map((grupo) => (
              <tr key={grupo.id}>
                {grupo.headers.map((h) => (
                  <th
                    key={h.id}
                    scope="col"
                    className="px-4 py-3 text-left font-semibold text-slate-600"
                  >
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tabla.getRowModel().rows.map((fila) => (
              <tr key={fila.id} className="hover:bg-slate-50">
                {fila.getVisibleCells().map((celda) => (
                  <td key={celda.id} className="px-4 py-3 align-middle">
                    {flexRender(celda.column.columnDef.cell, celda.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPaginas > 1 ? (
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-2">
          <span className="text-xs text-slate-500">
            Página {pageIndex + 1} de {totalPaginas}
          </span>
          <div className="flex gap-2">
            <Button
              variante="secundario"
              tamano="sm"
              disabled={!tabla.getCanPreviousPage()}
              onClick={() => tabla.previousPage()}
            >
              Anterior
            </Button>
            <Button
              variante="secundario"
              tamano="sm"
              disabled={!tabla.getCanNextPage()}
              onClick={() => tabla.nextPage()}
            >
              Siguiente
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
