import React, { useState } from 'react'
import { EntityPickerModal } from './ui/EntityPickerModal'
import { AddUomModal } from './AddUomModal'
import { useUomList } from '../hooks/useUoms'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSelect: (id: number, name: string) => void
  selectedId?: number
}

export function UomPickerModal({ isOpen, onClose, onSelect, selectedId }: Props) {
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)

  const { data, isLoading } = useUomList(search)
  const items = (data?.items ?? []).map(u => ({ id: u.id, name: u.name, code: u.code }))

  const handleClose = () => { setSearch(''); onClose() }
  const handleSelect = (id: number, name: string) => { onSelect(id, name); handleClose() }

  return (
    <>
      <EntityPickerModal
        isOpen={isOpen}
        onClose={handleClose}
        title="Select UOM"
        items={items}
        isLoading={isLoading}
        selectedId={selectedId}
        search={search}
        onSearchChange={setSearch}
        onSelect={handleSelect}
        onAddNew={() => setAddOpen(true)}
      />
      <AddUomModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={() => setAddOpen(false)}
      />
    </>
  )
}
