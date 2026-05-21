import React, { useState } from 'react'
import { EntityPickerModal } from './ui/EntityPickerModal'
import { AddCategoryModal } from './AddCategoryModal'
import { useCategoryList } from '../hooks/useCategories'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSelect: (id: number, name: string) => void
  selectedId?: number
}

export function CategoryPickerModal({ isOpen, onClose, onSelect, selectedId }: Props) {
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)

  const { data, isLoading } = useCategoryList(search)
  const items = (data?.items ?? []).map(c => ({ id: c.id, name: c.name, code: c.code }))

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
        title="Select Category"
        items={items}
        isLoading={isLoading}
        selectedId={selectedId}
        search={search}
        onSearchChange={setSearch}
        onSelect={handleSelect}
        onAddNew={() => setAddOpen(true)}
        addNewLabel="Add New Category"
      />

      <AddCategoryModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={handleCreated}
      />
    </>
  )
}
