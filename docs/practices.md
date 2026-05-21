# Order Management Dashboard - Development Practices

This document outlines the shared components, hooks, and patterns used across the application to ensure consistency and maintainability.

---

## Shared Components

### Input Components

| Component | Location | Usage |
|-----------|----------|-------|
| `PhoneInput` | `src/components/PhoneInput.tsx` | International phone input with country selector. Use for all mobile/phone fields. |
| `IonInputWrapper` | `src/components/UI/IonInputWrapper.tsx` | Wrapper for IonInput with consistent styling. |
| `DateOnlyPicker` | `src/components/DateOnlyPicker.tsx` | Date picker without time component. |

### Modal Components

| Component | Location | Usage |
|-----------|----------|-------|
| `ItemSelectModal` | `src/components/ItemSelectModal.tsx` | Searchable item selection with add new option. |
| `CustomerSelectModal` | `src/components/CustomerSelectModal.tsx` | Searchable customer selection with add new option. |
| `AuthorSelectModal` | `src/components/AuthorSelectModal.tsx` | Searchable author (employee) selection. |
| `PostCategorySelectModal` | `src/components/PostCategorySelectModal.tsx` | Multi-select category selection with checkboxes. |
| `AddCompanyModal` | `src/components/AddCompanyModal.tsx` | Modal for adding a new company. |
| `AddressFormModal` | `src/components/AddressFormModal.tsx` | Multi-step address form modal. |
| `PageFormModal` | `src/components/PageFormModal.tsx` | Segmented form for pages with Editor.js. |
| `PostFormModal` | `src/components/PostFormModal.tsx` | Segmented form for posts with Editor.js. |
| `DiscountFormModal` | `src/components/DiscountFormModal.tsx` | Segmented form for discounts (Info, Condition, Actions). |

---

## Hook | Modal Pattern

We use a **hook-based modal pattern** for selection modals. This pattern provides:
- Clean async/await API for opening modals
- Promise-based result handling
- No prop drilling for modal state
- Consistent UX across the application

### Pattern Structure

```typescript
// Hook: useXxxSelectModal.tsx
export function useXxxSelectModal() {
  const [resolver, setResolver] = useState<((value: XxxSelectEvent) => void) | null>(null);
  const [state, setState] = useState({ isOpen: false, ... });

  function openXxxSelect(data?: OpenData): Promise<XxxSelectEvent> {
    return new Promise((resolve) => {
      setResolver(() => resolve);
      setState({ isOpen: true, ... });
    });
  }

  function onClose() { ... }
  function onSelect(item: Xxx | null) { ... }

  const XxxSelectModalView = () => (
    <XxxSelectModal
      isOpen={state.isOpen}
      onClose={onClose}
      onSelect={onSelect}
      ...
    />
  );

  return { openXxxSelect, XxxSelectModalView };
}
```

### Usage Example

```typescript
function MyComponent() {
  const { openCompanySelect, CompanySelectModalView } = useCompanySelectModal();

  const handleSelectCompany = async () => {
    const result = await openCompanySelect({ selectedCompanyId: currentId });
    
    if (result.type === 'CompanySelected') {
      // Handle selection: result.data.company
    } else if (result.type === 'Cleared') {
      // Handle clear
    }
    // 'Cancelled' - user closed without action
  };

  return (
    <>
      <IonButton onClick={handleSelectCompany}>Select Company</IonButton>
      <CompanySelectModalView />
    </>
  );
}
```

### Available Selection Hooks

| Hook | Location | Returns |
|------|----------|---------|
| `useItemSelectModal` | `src/hooks/useItemSelectModal.tsx` | `{ openCompanySelect, CompanySelectModalView }` |
| `useCustomerSelectModal` | `src/hooks/useCustomerSelectModal.tsx` | `{ openCustomerSelect, CustomerSelectModalView }` |
| `useStateSelectModal` | `src/hooks/useStateSelectModal.tsx` | `{ openStateSelect, StateSelectModalView }` |
| `useAuthorSelectModal` | `src/hooks/useAuthorSelectModal.tsx` | `{ openAuthorSelect, AuthorSelectModalView }` |
| `useCategorySelectModal` | `src/hooks/useCategorySelectModal.tsx` | `{ openCategorySelect, CategorySelectModalView }` |
| `useAddCompanyModal` | `src/hooks/useAddCompanyModal.tsx` | `{ openAddCompany, AddCompanyModalView }` |
| `useAddressFormModal` | `src/hooks/useAddressFormModal.tsx` | `{ openAddressForm, AddressFormModalView }` |
| `usePageFormModal` | `src/hooks/usePageFormModal.tsx` | `{ openPageForm, PageFormModalView }` |
| `usePostFormModal` | `src/hooks/usePostFormModal.tsx` | `{ openPostForm, PostFormModalView }` |
| `useDiscountFormModal` | `src/hooks/useDiscountFormModal.tsx` | `{ openDiscountForm, DiscountFormModalView }` |

### Event Types

Each hook returns typed events:

```typescript
// Company Select
type CompanySelectEvent =
  | { type: 'CompanySelected'; data: { company: Company } }
  | { type: 'Cleared' }
  | { type: 'Cancelled' };

// Customer Select
type CustomerSelectEvent =
  | { type: 'CustomerSelected'; data: { customer: Customer } }
  | { type: 'Cleared' }
  | { type: 'Cancelled' };

// State Select
type StateSelectEvent =
  | { type: 'StateSelected'; data: { state: State } }
  | { type: 'Cleared' }
  | { type: 'Cancelled' };

// Discount Form
type DiscountFormEvent =
  | { type: 'DiscountCreated'; data: { discount: Discount } }
  | { type: 'DiscountUpdated'; data: { discount: Discount } }
  | { type: 'Cancelled' };
```

---

## Data Fetching Hooks

| Hook | Location | Purpose |
|------|----------|---------|
| `useItem` | `src/hooks/useItem.ts` | Fetch paginated item list |
| `useCustomers` | `src/hooks/useCustomers.ts` | Fetch paginated customers list |
| `useAddresses` | `src/hooks/useAddresses.ts` | Fetch paginated addresses list |
| `useStates` | `src/hooks/useStates.ts` | Fetch states by country |
| `useAttributes` | `src/hooks/useAttributes.ts` | Fetch product attributes |
| `useAttributeValues` | `src/hooks/useAttributeValues.ts` | Fetch attribute values |
| `useProducts` | `src/hooks/useProducts.ts` | Fetch products |
| `useProductCategories` | `src/hooks/useProductCategories.ts` | Fetch product categories |
| `useDiscounts` | `src/hooks/useDiscounts.ts` | Fetch discounts |
| `useEmployees` | `src/hooks/useEmployees.ts` | Fetch employees with search |
| `useWarehouses` | `src/hooks/useWarehouses.ts` | Fetch warehouses |
| `usePages` | `src/hooks/usePages.ts` | Fetch paginated pages |
| `usePosts` | `src/hooks/usePosts.ts` | Fetch paginated posts |
| `usePostCategories` | `src/hooks/usePostCategories.ts` | Fetch post categories |

---

## Static Data

Some data is hardcoded as it rarely changes:

### Countries
```typescript
// src/types/address.ts
export const COUNTRIES: Country[] = [
  { id: 1, name: 'United States', isoCode: 'US' },
  { id: 2, name: 'Canada', isoCode: 'CA' },
  { id: 3, name: 'Mexico', isoCode: 'MX' },
];
```

Use `IonSelect` for country selection (not a modal) since there are only 3 options.

---

## Form Patterns

### Multi-Step Forms

For complex forms (e.g., AddressFormModal), use step-based navigation:

```typescript
type FormStep = 'customer' | 'address' | 'appointment';

const [currentStep, setCurrentStep] = useState<FormStep>('customer');
```

### Field Validation

Validate on step transition and before save:

```typescript
const nextStep = () => {
  if (currentStep === 'customer') {
    if (!formData.customerId) {
      presentToast({ message: 'Please select a customer', duration: 2000, color: 'warning' });
      return;
    }
    goToStep('address');
  }
};
```

---

## Best Practices Checklist

- [ ] Use `PhoneInput` component for all phone/mobile fields
- [ ] Use hook-based modals for entity selection (company, customer, state)
- [ ] Use `IonSelect` for small static lists (countries, address type)
- [ ] Use searchable modals for large dynamic lists (companies, customers, states)
- [ ] Always render modal views at the end of component JSX
- [ ] Handle all event types (Selected, Cleared, Cancelled) from selection hooks
- [ ] Use `useIonToast` for user feedback messages
- [ ] Follow the naming convention: `useXxxModal` for hooks, `XxxModal` for components

---

## File Organization

```
src/
├── components/          # Reusable UI components
│   ├── UI/              # Basic UI wrappers
│   ├── common/          # Domain-agnostic shared components
│   └── catalog/         # Catalog-specific components
├── hooks/               # Custom React hooks
├── pages/               # Page components (routes)
├── services/            # API service functions
├── types/               # TypeScript type definitions
├── contexts/            # React contexts
├── providers/           # Provider components
└── lib/                 # Utility functions
```

---

## Segment Slider Pattern

For forms with multiple sections, use the segment slider pattern with Swiper.

### Hook

```typescript
// src/hooks/useSegmentSlider.tsx
export default function useSegmentSlider(segments: string[], defaultSegment: string) {
  const [swiper, setSwiper] = useState<Swiper | null>(null);
  const [segment, setSegment] = useState<string>(defaultSegment);

  function onSlideChange(swiper: Swiper) {
    setSegment(segments[swiper.activeIndex]);
  }

  function onSegmentChange(event: CustomEvent) {
    setSegment(event.detail.value);
    swiper?.slideTo(segments.indexOf(event.detail.value));
  }

  return { swiper, setSwiper, onSegmentChange, onSlideChange, segment, segments };
}
```

### Usage

```tsx
const SEGMENTS = ['Basic', 'Content', 'SEO'];

function MyFormModal() {
  const { setSwiper, onSegmentChange, onSlideChange, segment } =
    useSegmentSlider(SEGMENTS, 'Basic');

  return (
    <IonModal>
      <IonHeader>
        <IonToolbar>
          <IonSegment value={segment} onIonChange={onSegmentChange} mode="ios">
            {SEGMENTS.map((seg) => (
              <IonSegmentButton key={seg} value={seg}>
                <IonLabel>{seg}</IonLabel>
              </IonSegmentButton>
            ))}
          </IonSegment>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <Swiper onSwiper={setSwiper} onSlideChange={onSlideChange} style={{ height: '100%' }}>
          <SwiperSlide>{/* Basic fields */}</SwiperSlide>
          <SwiperSlide>{/* Content editor */}</SwiperSlide>
          <SwiperSlide>{/* SEO fields */}</SwiperSlide>
        </Swiper>
      </IonContent>
    </IonModal>
  );
}
```

---

## Editor.js Integration

For rich content editing (Pages, Posts), use Editor.js with block-based editing.

### Dependencies

```bash
npm install @editorjs/editorjs @editorjs/header @editorjs/list @editorjs/paragraph @editorjs/image @editorjs/embed @editorjs/quote @editorjs/delimiter @editorjs/table
```

### Setup

```typescript
import EditorJS, { OutputData } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import ImageTool from '@editorjs/image';
import Embed from '@editorjs/embed';
import Quote from '@editorjs/quote';
import Delimiter from '@editorjs/delimiter';
import Table from '@editorjs/table';

const editorRef = useRef<EditorJS | null>(null);
const editorContainerRef = useRef<HTMLDivElement>(null);
const [editorReady, setEditorReady] = useState(false);

function initializeEditor() {
  editorRef.current = new EditorJS({
    holder: editorContainerRef.current!,
    placeholder: 'Start writing...',
    data: existingContent, // OutputData format
    tools: {
      header: { class: Header, config: { levels: [1, 2, 3, 4, 5, 6], defaultLevel: 2 } },
      list: { class: List, inlineToolbar: true },
      paragraph: { class: Paragraph, inlineToolbar: true },
      image: {
        class: ImageTool,
        config: {
          uploader: {
            async uploadByFile(file: File) {
              // TODO: Implement S3 upload
              return { success: 0, file: { url: '' } };
            },
            async uploadByUrl(url: string) {
              return { success: 1, file: { url } };
            },
          },
        },
      },
      embed: { class: Embed, config: { services: { youtube: true, vimeo: true } } },
      quote: { class: Quote, inlineToolbar: true },
      delimiter: Delimiter,
      table: { class: Table, inlineToolbar: true },
    },
    onReady: () => setEditorReady(true),
  });
}

// Save content
async function saveContent() {
  if (editorRef.current && editorReady) {
    const outputData = await editorRef.current.save();
    return JSON.stringify(outputData);
  }
  return null;
}

// Cleanup
function cleanup() {
  if (editorRef.current) {
    editorRef.current.destroy();
    editorRef.current = null;
    setEditorReady(false);
  }
}
```

### Content Parsing

```typescript
function parseContentToEditorData(content: string | null): OutputData {
  if (!content) return { blocks: [] };

  try {
    const parsed = JSON.parse(content);
    if (parsed.blocks && Array.isArray(parsed.blocks)) {
      return parsed;
    }
  } catch {
    // Convert plain text/HTML to paragraph
    return { blocks: [{ type: 'paragraph', data: { text: content } }] };
  }

  return { blocks: [] };
}
```

---

## Multi-Select Pattern

For selecting multiple items (e.g., categories), use checkboxes in a modal.

### Modal Component

```tsx
function MultiSelectModal({ selectedIds, onConfirm }) {
  const [selected, setSelected] = useState<Set<number>>(new Set(selectedIds));

  function toggleItem(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <IonModal>
      <IonList>
        {items.map((item) => (
          <IonItem key={item.id} button onClick={() => toggleItem(item.id)}>
            <IonCheckbox slot="start" checked={selected.has(item.id)} />
            <IonLabel>{item.title}</IonLabel>
          </IonItem>
        ))}
      </IonList>
      <IonFooter>
        <IonButton onClick={() => onConfirm(Array.from(selected))}>
          Confirm ({selected.size})
        </IonButton>
      </IonFooter>
    </IonModal>
  );
}
```

### Display Selected Items as Chips

```tsx
<div className="flex flex-wrap gap-2">
  {selectedCategories.map((cat) => (
    <IonChip key={cat.id} outline>
      {cat.title}
      <IonButton fill="clear" size="small" onClick={() => removeCategory(cat.id)}>
        <Icon path={mdiClose} size={0.7} />
      </IonButton>
    </IonChip>
  ))}
</div>
```

---

## Strict 4-Prop Modal Pattern

For complex modals that need to emit events (e.g., selection modals with "Add New" functionality), use a strict 4-prop interface to keep state management clean and predictable.

### Modal Props

Every modal following this pattern accepts **exactly 4 props**:

```typescript
interface XxxModalProps {
  isOpen: boolean;              // Controls modal visibility
  onClose: () => void;          // Called when modal closes
  onEvent: (event: XxxEvent) => void;  // Emits typed events
  data: XxxModalData;           // All input data passed here
}
```

### Key Rules

1. **All custom values go through `data`** - Never add extra props for customer ID, selected item, etc.
2. **State lives inside the modal** - Search state, loading state, internal UI state are managed within the component
3. **Child modals are invoked inside** - If the modal needs to open another modal (e.g., "Add New"), that hook is used inside the component, not in the parent hook
4. **Events are typed discriminated unions** - Use `{ type: 'Selected'; data: {...} } | { type: 'Cancelled' }` pattern

### Example: CustomerContactSelectModal

```typescript
// Types
interface CustomerContactSelectModalData {
  customerId: number;
  customerEmail?: string;
  selectedContactId?: number | null;
}

type CustomerContactSelectEvent =
  | { type: 'ContactSelected'; data: { contact: CustomerContact } }
  | { type: 'CustomerEmailSelected'; data: { email: string } }
  | { type: 'Cancelled' };

// Modal Component - manages its own state
function CustomerContactSelectModal({
  isOpen,
  onClose,
  onEvent,
  data,
}: CustomerContactSelectModalProps) {
  // Internal state
  const [search, setSearch] = useState('');

  // Child modal invoked INSIDE this component
  const { openAddCustomerContact, AddCustomerContactModalView } = useAddCustomerContactModal();

  async function handleAddNew() {
    const result = await openAddCustomerContact({ customerId: data.customerId });
    if (result.type === 'ContactAdded') {
      onEvent({ type: 'ContactSelected', data: { contact: result.data.contact } });
    }
  }

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={() => onEvent({ type: 'Cancelled' })}>
        {/* Modal content */}
      </IonModal>
      <AddCustomerContactModalView />
    </>
  );
}
```

### Hook Structure

The hook is minimal - it only manages promise resolution and passes data through:

```typescript
export function useCustomerContactSelectModal() {
  const [resolver, setResolver] = useState<((value: CustomerContactSelectEvent) => void) | null>(null);
  const [state, setState] = useState<{ isOpen: boolean; data: CustomerContactSelectModalData }>({
    isOpen: false,
    data: { customerId: 0 },
  });

  function openCustomerContactSelect(openData: OpenData): Promise<CustomerContactSelectEvent> {
    return new Promise((resolve) => {
      setResolver(() => resolve);
      setState({ isOpen: true, data: { ...openData } });
    });
  }

  function onEvent(event: CustomerContactSelectEvent) {
    setState((prev) => ({ ...prev, isOpen: false }));
    resolver?.(event);
  }

  const CustomerContactSelectModalView = () => (
    <CustomerContactSelectModal
      isOpen={state.isOpen}
      onClose={() => setState((prev) => ({ ...prev, isOpen: false }))}
      onEvent={onEvent}
      data={state.data}
    />
  );

  return { openCustomerContactSelect, CustomerContactSelectModalView };
}
```

### Benefits

- **Predictable interface** - Every modal works the same way
- **Encapsulated state** - Modal manages its own complexity
- **Composable** - Modals can nest other modals cleanly
- **Testable** - Easy to mock with just 4 props

---

## Additional Documentation

For detailed architecture information including:
- Backend patterns (Repository, Form Requests, Resources)
- API response formats
- Naming conventions
- Database patterns
- Authentication

See: **[ARCHITECTURE.md](./ARCHITECTURE.md)**
