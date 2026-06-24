import { useMemo, useState } from 'react'
import { EntityPickerModal } from './ui/EntityPickerModal'
import { useOrderList } from '../hooks/useOrders'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSelect: (id: number, orderCode: string) => void
  selectedId?: number
}

export function OrderPickerModal({ isOpen, onClose, onSelect, selectedId }: Props) {
  const [search, setSearch] = useState('')

  const { data, isLoading } = useOrderList(search)

  const items = useMemo(
    () =>
      (data?.items ?? []).map((o: any) => ({
        id: o.id,
        name: o.orderCode ?? o.code ?? `Order #${o.id}`,
        code: o.orderCode ?? o.code,
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
      title="Select Order"
      items={items}
      isLoading={isLoading}
      selectedId={selectedId}
      search={search}
      onSearchChange={setSearch}
      onSelect={handleSelect}
    />
  )
}
