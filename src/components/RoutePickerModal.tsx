import React, { useState } from 'react'
import { EntityPickerModal } from './ui/EntityPickerModal'
import { useRouteList } from '../hooks/useRoutes'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSelect: (id: number, name: string) => void
  selectedId?: number
}

export function RoutePickerModal({ isOpen, onClose, onSelect, selectedId }: Props) {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useRouteList(search)

  const items = (data?.items ?? []).map(r => ({
    id: r.id,
    name: r.name,
    code: r.code,
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
      title="Select Route"
      items={items}
      isLoading={isLoading}
      selectedId={selectedId}
      search={search}
      onSearchChange={setSearch}
      onSelect={handleSelect}
    />
  )
}
