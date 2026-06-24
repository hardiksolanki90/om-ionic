import { useMemo, useState } from 'react'
import { EntityPickerModal } from './ui/EntityPickerModal'
import { useCustomerListInfinite } from '../hooks/useCustomers'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSelect: (id: number, name: string, extra?: { shopName?: string; firstName?: string; lastName?: string }) => void
  selectedId?: number
}

export function CustomerPickerModal({ isOpen, onClose, onSelect, selectedId }: Props) {
  const [search, setSearch] = useState('')

  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useCustomerListInfinite(search)

  const rawCustomers = useMemo(
    () =>
      (data?.pages ?? []).flatMap(page => page.items ?? page.customers ?? []).map((c: any) => ({
        id: c.id,
        name: c.shopName ?? `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim(),
        code: c.customerCode,
        shopName: c.shopName,
        firstName: c.firstName,
        lastName: c.lastName,
      })),
    [data],
  )

  const items = useMemo(() => rawCustomers.map(({ shopName: _s, firstName: _f, lastName: _l, ...rest }) => rest), [rawCustomers])

  const handleClose = () => {
    setSearch('')
    onClose()
  }

  const handleSelect = (id: number, name: string) => {
    const customer = rawCustomers.find(c => c.id === id)
    onSelect(id, name, customer ? { shopName: customer.shopName, firstName: customer.firstName, lastName: customer.lastName } : undefined)
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
