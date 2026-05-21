import { useState } from 'react'
import { EntityPickerModal } from './ui/EntityPickerModal'
import { useAreaList } from '../hooks/useAreas'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSelect: (id: number, name: string) => void
  selectedId?: number
}

export function AreaPickerModal({ isOpen, onClose, onSelect, selectedId }: Props) {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useAreaList(search)

  const items = (data?.items ?? []).map(a => ({
    id: a.id,
    name: a.name,
    code: a.code,
  }))

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
      title="Select Area"
      items={items}
      isLoading={isLoading}
      selectedId={selectedId}
      search={search}
      onSearchChange={setSearch}
      onSelect={handleSelect}
    />
  )
}
