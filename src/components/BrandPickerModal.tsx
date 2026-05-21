import React, { useState } from 'react'
import { EntityPickerModal } from './ui/EntityPickerModal'
import { AddBrandModal } from './AddBrandModal'
import { useBrandList } from '../hooks/useBrands'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSelect: (id: number, name: string) => void
  selectedId?: number
}

export function BrandPickerModal({ isOpen, onClose, onSelect, selectedId }: Props) {
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)

  const { data, isLoading } = useBrandList(search)
  const items = (data?.items ?? []).map(b => ({ id: b.id, name: b.name, code: b.code }))

  const handleClose = () => {
    setSearch('')
    onClose()
  }

  const handleSelect = (id: number, name: string) => {
    onSelect(id, name)
    handleClose()
  }

  const handleCreated = () => {
    setAddOpen(false)
  }

  return (
    <>
      <EntityPickerModal
        isOpen={isOpen}
        onClose={handleClose}
        title="Select Brand"
        items={items}
        isLoading={isLoading}
        selectedId={selectedId}
        search={search}
        onSearchChange={setSearch}
        onSelect={handleSelect}
        onAddNew={() => setAddOpen(true)}
        addNewLabel="Add New Brand"
      />

      <AddBrandModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={handleCreated}
      />
    </>
  )
}
