import React, { useState } from 'react'
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonButtons, IonSpinner, useIonToast,
} from '@ionic/react'
import { useCreateCategory } from '../hooks/useCategories'

interface Props {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}

export function AddCategoryModal({ isOpen, onClose, onCreated }: Props) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [tax, setTax] = useState('')
  const [error, setError] = useState('')

  const createCategory = useCreateCategory()
  const [present] = useIonToast()

  const reset = () => {
    setName('')
    setCode('')
    setTax('')
    setError('')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = async () => {
    if (!name.trim() || !code.trim()) {
      setError('Name and code are required')
      return
    }
    try {
      const res = await createCategory.mutateAsync({
        name: name.trim(),
        code: code.trim(),
        tax: tax.trim() || '0',
        status: '1',
      })
      present({ message: `Category "${res.item.name}" created`, duration: 2500, position: 'top', color: 'success' })
      onCreated()
      handleClose()
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to create category'
      setError(msg)
      present({ message: msg, duration: 3000, position: 'top', color: 'danger' })
    }
  }

  return (
    <IonModal isOpen={isOpen} onDidDismiss={handleClose}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={handleClose}>Cancel</IonButton>
          </IonButtons>
          <IonTitle>New Category</IonTitle>
          <IonButtons slot="end">
            <IonButton
              strong
              onClick={handleSubmit}
              disabled={createCategory.isPending}
            >
              {createCategory.isPending
                ? <IonSpinner name="crescent" className="w-4 h-4" />
                : 'Save'}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div className="space-y-4 pt-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Electronics"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              className="h-10 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. ELEC"
              value={code}
              onChange={e => setCode(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tax %</label>
            <input
              type="number"
              placeholder="0"
              value={tax}
              onChange={e => setTax(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
        </div>
      </IonContent>
    </IonModal>
  )
}
