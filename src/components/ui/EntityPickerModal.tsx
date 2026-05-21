import React from 'react'
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonButton, IonSearchbar, IonList, IonItem,
  IonLabel, IonSpinner, IonText, IonIcon,
  IonInfiniteScroll, IonInfiniteScrollContent,
} from '@ionic/react'
import { addOutline, arrowBackOutline } from 'ionicons/icons'

export interface PickerItem {
  id: number
  name: string
  code?: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  title: string
  items: PickerItem[]
  isLoading: boolean
  selectedId?: number
  search: string
  onSearchChange: (value: string) => void
  onSelect: (id: number, name: string) => void
  onAddNew?: () => void
  addNewLabel?: string
  emptyText?: string
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  fetchNextPage?: () => void
}

export function EntityPickerModal({
  isOpen,
  onClose,
  title,
  items,
  isLoading,
  selectedId,
  search,
  onSearchChange,
  onSelect,
  onAddNew,
  emptyText = 'No results found',
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: Props) {
  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      initialBreakpoint={1}
      breakpoints={[0, 0.5, 1]}
    >
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={onClose}>
              <IonIcon icon={arrowBackOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
          <IonTitle>{title}</IonTitle>
          {onAddNew && (
            <IonButtons slot="end">
              <IonButton onClick={onAddNew}>
                <IonIcon icon={addOutline} slot="start" />
                Add New
              </IonButton>
            </IonButtons>
          )}
        </IonToolbar>
        <IonToolbar mode="ios">
          <IonSearchbar
            value={search}
            onIonInput={e => onSearchChange(e.detail.value ?? '')}
            onIonClear={() => onSearchChange('')}
            placeholder={`Search ${title.toLowerCase()}…`}
            debounce={300}
          />
        </IonToolbar>
      </IonHeader>

      <IonContent color="light">
        {isLoading && items.length === 0 ? (
          <div className="ion-padding ion-text-center">
            <IonSpinner />
          </div>
        ) : items.length === 0 ? (
          <div className="ion-padding ion-text-center">
            <IonText color="medium">
              <p>{search.trim() ? emptyText : `No ${title.toLowerCase()} yet`}</p>
            </IonText>
          </div>
        ) : (
          <IonList mode="md" inset>
            {items.map(item => (
              <IonItem
                key={item.id}
                button
                detail={false}
                onClick={() => onSelect(item.id, item.name)}
                color={selectedId === item.id ? 'primary' : undefined}
              >
                <IonLabel>
                  <h2>{item.name}</h2>
                  {item.code && <p>{item.code}</p>}
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        )}

        {fetchNextPage && (
          <IonInfiniteScroll
            disabled={!hasNextPage}
            onIonInfinite={async (e) => {
              try {
                if (hasNextPage && !isFetchingNextPage) await fetchNextPage()
              } finally {
                ;(e.target as HTMLIonInfiniteScrollElement).complete()
              }
            }}
          >
            <IonInfiniteScrollContent loadingText="Loading more…" />
          </IonInfiniteScroll>
        )}
      </IonContent>
    </IonModal>
  )
}
