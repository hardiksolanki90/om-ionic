import React, { useState } from 'react'
import { EntityPickerModal } from './ui/EntityPickerModal'
import { useSalesmanList } from '../hooks/useSalesman'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSelect: (id: number, name: string) => void
  selectedId?: number
}

export function SalesmanPickerModal({ isOpen, onClose, onSelect, selectedId }: Props) {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useSalesmanList(search)

  const items = (data?.items ?? []).map(s => ({
    id: s.id,
    name: `${s.firstName} ${s.lastName}`,
    code: s.code,
  }))

  const handleClose = () => { setSearch(''); onClose() }

  const handleSelect = (id: number, name: string) => {
    onSelect(id, name)
    handleClose()
  }

  return (
    <EntityPickerModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Select Salesman"
      items={items}
      isLoading={isLoading}
      selectedId={selectedId}
      search={search}
      onSearchChange={setSearch}
      onSelect={handleSelect}
    />
  )
}
