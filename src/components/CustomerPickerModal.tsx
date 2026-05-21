import { useMemo, useState } from 'react'
import { EntityPickerModal } from './ui/EntityPickerModal'
import { useCustomerListInfinite } from '../hooks/useCustomers'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSelect: (id: number, name: string) => void
  selectedId?: number
}

export function CustomerPickerModal({ isOpen, onClose, onSelect, selectedId }: Props) {
  const [search, setSearch] = useState('')

  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useCustomerListInfinite(search)

  const items = useMemo(
    () =>
      (data?.pages ?? []).flatMap(page => page.items ?? page.customers ?? []).map(c => ({
        id: c.id,
        name: c.shopName,
        code: c.customerCode,
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
      title="Select Customer"
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
