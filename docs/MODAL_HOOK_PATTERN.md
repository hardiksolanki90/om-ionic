# Modal | Hook Pattern

**Last Updated:** 2026-01-28

## Overview

The Modal | Hook pattern provides a standardized way to create reusable, Promise-based modals in the application. This pattern separates the modal UI component from its state management, enabling imperative usage (`await openModal()`) while maintaining React's declarative rendering.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Consumer Component                       │
│                                                                  │
│   const { openModal, ModalView } = useMyModal();                │
│                                                                  │
│   const result = await openModal({ ...data });                  │
│                                                                  │
│   return <><ModalView /><OtherContent /></>                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                           Hook                                   │
│                     (useMyModal.tsx)                            │
│                                                                  │
│   - Manages state (isOpen, data, resolver)                      │
│   - Provides open() function → returns Promise                  │
│   - Provides ModalView component                                │
│   - Handles onClose and onEvent callbacks                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Modal Component                             │
│                    (MyModal.tsx)                                 │
│                                                                  │
│   STRICT 4-PROP INTERFACE:                                      │
│   - isOpen: boolean                                             │
│   - onClose: () => void                                         │
│   - data: ModalData (all custom props bundled here)             │
│   - onEvent: (event: ModalEvent) => void                        │
└─────────────────────────────────────────────────────────────────┘
```

## The 4-Prop Rule

**Every modal component MUST have exactly these 4 props:**

```typescript
interface ModalProps<TData = any, TEvent = any> {
    isOpen: boolean;
    onClose: () => void;
    data?: TData;
    onEvent?: (event: TEvent) => void;
}
```

| Prop | Type | Purpose |
|------|------|---------|
| `isOpen` | `boolean` | Controls modal visibility |
| `onClose` | `() => void` | Called when modal should close (cancel, backdrop tap, X button) |
| `data` | `TData` | **All custom props bundled into one object** |
| `onEvent` | `(event: TEvent) => void` | Called when modal emits an event (success, selection, etc.) |

### Why 4 Props?

1. **Consistency** - Every modal has the same interface
2. **Predictability** - Easy to understand how any modal works
3. **Type Safety** - `data` and event types can be strongly typed
4. **Flexibility** - Any custom data goes into `data`, any result goes through `onEvent`

## File Structure

```
src/
├── components/
│   └── [Domain]/
│       └── MyModal.tsx           # Modal UI component (4 props)
│
└── hooks/
    └── [Domain]/
        └── useMyModal.tsx        # Hook managing modal state
```

## Implementation Guide

### Step 1: Define Types

```typescript
// types/MyModalTypes.ts

// Data passed TO the modal
export interface MyModalData {
    title?: string;
    items: Item[];
    selectedId?: number;
}

// Event emitted FROM the modal
export interface MyModalEvent {
    eventType: 'ItemSelected' | 'Cancelled';
    item?: Item;
}
```

### Step 2: Create Modal Component

```typescript
// components/Domain/MyModal.tsx

import { IonModal, IonHeader, IonContent, IonButton } from '@ionic/react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    data?: MyModalData;
    onEvent?: (event: MyModalEvent) => void;
}

export default function MyModal({ isOpen, onClose, data, onEvent }: ModalProps) {

    function handleSelect(item: Item) {
        onEvent?.({ eventType: 'ItemSelected', item });
    }

    function handleCancel() {
        onClose();
    }

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>{data?.title || 'Select Item'}</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleCancel}>Cancel</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                {data?.items?.map(item => (
                    <IonItem
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        color={item.id === data?.selectedId ? 'primary' : undefined}
                    >
                        {item.name}
                    </IonItem>
                ))}
            </IonContent>
        </IonModal>
    );
}
```

### Step 3: Create Hook

```typescript
// hooks/Domain/useMyModal.tsx

import { useState } from 'react';
import MyModal from '../../components/Domain/MyModal';
import { MyModalData, MyModalEvent } from '../../types/MyModalTypes';

export default function useMyModal() {
    // Resolver stores the Promise resolve function
    const [resolver, setResolver] = useState<((value: any) => void) | null>(null);

    // State for modal visibility and data
    const [state, setState] = useState<{
        isOpen: boolean;
        data: MyModalData | null;
    }>({
        isOpen: false,
        data: null,
    });

    /**
     * Opens the modal and returns a Promise that resolves with the result
     * @param data - Data to pass to the modal
     * @returns Promise resolving to selected item or null if cancelled
     */
    function open(data: MyModalData): Promise<Item | null> {
        return new Promise((resolve) => {
            setResolver(() => resolve);
            setState({ data, isOpen: true });
        });
    }

    /**
     * Called when modal is closed without selection (cancel, backdrop tap)
     */
    function onClose() {
        if (state.isOpen) {
            setState({ isOpen: false, data: null });
            resolver?.(null);
        }
    }

    /**
     * Called when modal emits an event
     */
    function onEvent(event: MyModalEvent) {
        if (event.eventType === 'ItemSelected') {
            setState({ isOpen: false, data: null });
            resolver?.(event.item);
        }
        // Handle other event types as needed
    }

    /**
     * Component to render in the consumer's JSX
     */
    const MyModalView = () => (
        <MyModal
            isOpen={state.isOpen}
            onClose={onClose}
            data={state.data}
            onEvent={onEvent}
        />
    );

    return {
        open,
        MyModalView,
    };
}
```

### Step 4: Use in Consumer Component

```typescript
// pages/MyPage.tsx

import useMyModal from '../hooks/Domain/useMyModal';

export default function MyPage() {
    const { open: openItemSelector, MyModalView } = useMyModal();

    async function handleSelectItem() {
        const selectedItem = await openItemSelector({
            title: 'Choose an Item',
            items: myItems,
            selectedId: currentItemId,
        });

        if (selectedItem) {
            // User selected an item
            console.log('Selected:', selectedItem);
        } else {
            // User cancelled
            console.log('Cancelled');
        }
    }

    return (
        <IonPage>
            <IonContent>
                <IonButton onClick={handleSelectItem}>
                    Select Item
                </IonButton>
            </IonContent>

            {/* IMPORTANT: Render the modal view */}
            <MyModalView />
        </IonPage>
    );
}
```

## Event Patterns

### Simple Selection (returns single value)

```typescript
// Hook resolves with the selected value directly
function onEvent(event: MyModalEvent) {
    if (event.eventType === 'Selected') {
        setState({ isOpen: false, data: null });
        resolver?.(event.value);  // Resolve with value
    }
}

// Usage
const value = await open(data);  // Returns value or null
```

### Complex Result (returns object)

```typescript
// Hook resolves with full event data
function onEvent(event: MyModalEvent) {
    if (event.eventType === 'Completed') {
        setState({ isOpen: false, data: null });
        resolver?.(event);  // Resolve with entire event
    }
}

// Usage
const result = await open(data);
if (result?.eventType === 'Completed') {
    // Handle result.data, result.metadata, etc.
}
```

### Multiple Event Types

```typescript
interface ModalEvent {
    eventType: 'Created' | 'Updated' | 'Deleted';
    data: any;
}

function onEvent(event: ModalEvent) {
    switch (event.eventType) {
        case 'Created':
        case 'Updated':
        case 'Deleted':
            setState({ isOpen: false, data: null });
            resolver?.(event);
            break;
    }
}
```

## Best Practices

### DO

- **Always use the 4-prop interface** for modal components
- **Bundle all custom props into `data`** - never add extra props
- **Use TypeScript** for type safety on `data` and events
- **Handle `null` returns** - always check if user cancelled
- **Render `ModalView`** in the consumer component's JSX
- **Reset state on close** - clear data when modal closes

### DON'T

- **Don't add extra props** to modal components beyond the 4 standard ones
- **Don't manage modal state** in the consumer component
- **Don't forget to render `ModalView`** - modal won't appear without it
- **Don't resolve Promise multiple times** - check `isOpen` before resolving

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Hook file | `use[Name]Modal.tsx` | `usePlayerSelectorModal.tsx` |
| Hook function | `use[Name]Modal` | `usePlayerSelectorModal()` |
| Open function | `open` or `open[Name]` | `open()`, `openPlayerSelector()` |
| View component | `[Name]ModalView` | `PlayerSelectorModalView` |
| Modal component | `[Name]Modal.tsx` | `PlayerSelectorModal.tsx` |
| Data type | `[Name]ModalData` | `PlayerSelectorModalData` |
| Event type | `[Name]ModalEvent` | `PlayerSelectorModalEvent` |

## Migration from Legacy Modals

If you have modals using local state (`useState` for `isOpen`), migrate as follows:

### Before (Legacy)

```typescript
// Consumer has modal state
const [isModalOpen, setIsModalOpen] = useState(false);
const [modalData, setModalData] = useState(null);

<MyModal
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    customProp1={value1}
    customProp2={value2}
    onSelect={(result) => {
        handleResult(result);
        setIsModalOpen(false);
    }}
/>
```

### After (Modal | Hook Pattern)

```typescript
// Consumer uses hook
const { open, MyModalView } = useMyModal();

const result = await open({ customProp1: value1, customProp2: value2 });
if (result) {
    handleResult(result);
}

<MyModalView />
```

## When to Use Which Pattern

### Use Modal | Hook Pattern When:
- Modal is used by a **single component**
- State doesn't need to be shared across components
- Simple open → result flow

### Use Zustand Store Pattern When:
- Modal needs to be opened from **multiple components**
- Modal needs to be opened from **services/classes** (non-React code)
- State needs to be **shared globally**
- Multiple components need to react to modal state changes

### Why Zustand for Scoring Modals

The scoring modals use Zustand because:

1. **Service classes need access** - `OutEventService` (a class, not React component) needs to open modals
2. **Multiple entry points** - Modals can be opened from KeyPadArea, Scoring.tsx, or services
3. **Shared state** - `ScoringModalsView` renders modals based on global state

```
┌─────────────────────────────────────────────────┐
│         Zustand Store (singleton)               │
│  outTypeModal: { isOpen, data, resolver }       │
└─────────────────────────────────────────────────┘
        ▲                          │
        │ write                    │ read
┌───────┴───────┐          ┌───────┴───────┐
│ OutEventService│          │ScoringModalsView│
│ KeyPadArea     │          │ (renders modal) │
│ Scoring.tsx    │          └─────────────────┘
└────────────────┘
```

### Critical: Avoid Multiple Hook Instances

**WRONG** - Multiple components calling same hook creates separate state:
```typescript
// Component A - has its own isOpen state
const { open } = useMyModal();

// Component B - has DIFFERENT isOpen state
const { ModalView } = useMyModal();
// ModalView won't open when Component A calls open()!
```

**CORRECT** - Use Zustand for shared state:
```typescript
// Any component can open
const { openMyModal } = useMyModalsStore();

// One component renders (subscribes to same state)
const { myModal } = useMyModalsStore();
<MyModal isOpen={myModal.isOpen} ... />
```

## Integration with Zustand

For modals managed by a global Zustand store (like `ScoringModalsView`), the pattern adapts slightly:

```typescript
// Store manages state
const useScoringModalsStore = create((set) => ({
    outTypeModal: { isOpen: false, data: null },
    openOutTypeSelector: (data) => set({ outTypeModal: { isOpen: true, data } }),
    closeOutTypeSelector: () => set({ outTypeModal: { isOpen: false, data: null } }),
}));

// ScoringModalsView renders all modals
function ScoringModalsView() {
    const { outTypeModal, closeOutTypeSelector } = useScoringModalsStore();

    return (
        <OutTypeSelectorModal
            isOpen={outTypeModal.isOpen}
            onClose={closeOutTypeSelector}
            data={outTypeModal.data}
            onEvent={handleOutTypeEvent}
        />
    );
}
```

## Examples in Codebase

| Hook | Modal | Purpose |
|------|-------|---------|
| `useCreateFixtureFormFieldsModal` | `CreateFixtureFormFieldsModal` | Create/edit fixtures |
| `useTeamSelectorModal` | `TeamSelectorModal` | Select a team |
| `useChooseFixtureSquadModal` | `ChooseFixtureSquadModal` | Select squad players |
| `useGroundSelectionModal` | `GroundSelectionModal` | Select ground/venue |
| `useMatchOfficialsModal` | `MatchOfficialsModal` | Select match officials |

## Related Documentation

- `docs/SCORING_MODAL_MIGRATION_CONTEXT.md` - Scoring modal migration status
- `src/hooks/scoring/INTEGRATION_GUIDE.md` - Scoring hooks integration
