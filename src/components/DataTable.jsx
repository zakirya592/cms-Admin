import { Button, Table } from "@heroui/react";
import { Pencil, Trash2 } from "lucide-react";

export function DataTable({ label, rows, columns, onEdit, onDelete, empty }) {
  const showActions = Boolean(onEdit || onDelete);

  if (rows.length === 0) {
    return (
      <div className="glass-panel rounded-2xl border border-dashed border-white/75 px-6 py-16 text-center shadow-xs">
        <p className="font-serif text-2xl text-ink">Nothing on this list</p>
        <p className="mt-2 text-sm text-stone-500">{empty}</p>
      </div>
    );
  }

  return (
    <div className="glass-card office-table-scroll overflow-x-auto rounded-2xl shadow-[0_10px_30px_-5px_rgba(28,25,20,0.06)]">
      <Table className="w-max min-w-full overflow-visible">
        <Table.ScrollContainer className="overflow-visible">
          <Table.Content aria-label={label} className="w-max min-w-full">
            <Table.Header>
              {columns.map((column) => (
                <Table.Column key={column.header} isRowHeader={column.rowHeader} className="whitespace-nowrap bg-white/40 text-xs font-medium uppercase tracking-wider text-stone-600 px-4 py-3 border-b border-white/50">
                  {column.header}
                </Table.Column>
              ))}
              {showActions && <Table.Column className="whitespace-nowrap bg-white/40 text-xs font-medium uppercase tracking-wider text-stone-600 px-4 py-3 border-b border-white/50">Actions</Table.Column>}
            </Table.Header>
            <Table.Body>
              {rows.map((row) => (
                <Table.Row key={row.id} id={row.id} className="border-b border-white/40 hover:bg-white/40 transition-colors">
                  {columns.map((column) => (
                    <Table.Cell key={column.header} className="whitespace-nowrap px-4 py-3.5 text-sm text-stone-800">
                      {column.cell(row)}
                    </Table.Cell>
                  ))}
                  {showActions && (
                    <Table.Cell className="px-4 py-3.5">
                      <div className="flex gap-1">
                        {onEdit && (
                          <Button
                            isIconOnly
                            aria-label={`Edit ${label} row`}
                            variant="ghost"
                            size="sm"
                            className="rounded-lg hover:bg-white/80 hover:text-ink text-stone-600 transition-colors"
                            onPress={() => onEdit(row)}
                          >
                            <Pencil size={14} />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            isIconOnly
                            aria-label={`Remove ${label} row`}
                            variant="ghost"
                            size="sm"
                            className="rounded-lg hover:bg-rose-100/70 hover:text-rose-700 text-stone-600 transition-colors"
                            onPress={() => onDelete(row)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </div>
                    </Table.Cell>
                  )}
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </div>
  );
}
