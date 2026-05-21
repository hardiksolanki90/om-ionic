import React, { useState, useMemo } from 'react'
import { EntityPickerModal } from './ui/EntityPickerModal'
import { useItemListInfinite } from '../hooks/useItems'

export interface ItemUomOption { id: number; name: string }

interface Props {
  isOpen: boolean
  onClose: () => void
  onSelect: (id: number, name: string, price: number, tax: number, uoms: ItemUomOption[]) => void
  selectedId?: number
}

export function ItemPickerModal({ isOpen, onClose, onSelect, selectedId }: Props) {
  const [search, setSearch] = useState('')

  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useItemListInfinite(search)

  const rawItems = useMemo(() =>
    (data?.pages ?? []).flatMap(p => p.items).map(i => {
      const raw = i as any
      const baseUoms: ItemUomOption[] = raw.baseUomId
        ? [{ id: Number(raw.baseUomId), name: raw.baseUomName ?? 'Base' }]
        : []
      const secUoms: ItemUomOption[] = (raw.secondaryUoms ?? []).map((s: any) => ({
        id: Number(s.uomId),
        name: s.uomName ?? '',
      })).filter((s: ItemUomOption) => s.id && s.name)
      return {
        id: i.id,
        name: raw.itemName ?? raw.name ?? '',
        code: raw.itemCode ?? raw.code ?? '',
        price: Number(raw.itemPrice ?? raw.price) || 0,
        tax: Number(raw.tax) || 0,
        uoms: [...baseUoms, ...secUoms],
      }
    }),
    [data]
  )

  const items = useMemo(() => rawItems.map(({ uoms: _u, ...rest }) => rest), [rawItems])

  const handleClose = () => { setSearch(''); onClose() }

  const handleSelect = (id: number, name: string) => {
    const item = rawItems.find(i => i.id === id)
    onSelect(id, name, item?.price ?? 0, item?.tax ?? 0, item?.uoms ?? [])
    handleClose()
  }

  return (
    <EntityPickerModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Select Item"
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
