import { useMemo, useState } from 'react'
import { EntityPickerModal } from './ui/EntityPickerModal'
import { useWarehouseListInfinite } from '../hooks/useWarehouses'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSelect: (id: number, name: string) => void
  selectedId?: number
}

export function WarehousePickerModal({ isOpen, onClose, onSelect, selectedId }: Props) {
  const [search, setSearch] = useState('')

  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useWarehouseListInfinite(search, isOpen)

  const items = useMemo(
    () =>
      (data?.pages ?? []).flatMap(page => page.items ?? page.warehouses ?? []).map((w: any) => ({
        id: w.id,
        name: w.name ?? w.warehouseName ?? '',
        code: w.code ?? w.warehouseCode ?? '',
      })),
    [data],
  )

  const handleClose = () => {
    setSearch('')
    onClose()
  }

  const handleSelect = (id: number, name: string) => {
    onSelect(id, name)
    handleClose()
  }

  return (
    <EntityPickerModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Select Warehouse"
      items={items}
      isLoading={isLoading}
      selectedId={selectedId}
      search={search}
      onSearchChange={setSearch}
      onSelect={handleSelect}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
    />
  )
}
