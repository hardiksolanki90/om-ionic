# Smart Search Pattern Documentation

## Overview
This document describes the standardized search pattern used across all components in the BWD E-commerce Dashboard. This pattern provides intelligent, field-specific searching with fuzzy matching capabilities.

## Core Principles

### 1. **Field-Specific Search**
Users can search across specific fields or all fields. The search UI shows available field options based on the search query type.

### 2. **Smart Field Filtering**
- **Numeric queries**: Only show ID-based search options
- **Email-format queries**: Only show email search option
- **Text queries**: Show all text-based search options

### 3. **Fuzzy Matching**
Text searches use normalized fuzzy matching where:
- Spaces are ignored during comparison
- `"j & k"` matches `"j&k"` and vice versa
- `"john smith"` matches `"JohnSmith"`, `"John Smith"`, `"john-smith"`, etc.

### 4. **URL State Persistence**
Search state is saved in URL parameters for:
- Browser history support (back/forward)
- Bookmarking/sharing searches
- Page refresh preservation

## Implementation Pattern

### Frontend Structure

```typescript
// 1. Define search field type
type SearchField = 'id' | 'name' | 'email' | 'company' | ...;

// 2. Define available search options
const SEARCH_FIELD_OPTIONS: Array<{ value: SearchField; label: string }> = [
  { value: 'id', label: 'ID' },
  { value: 'name', label: 'Customer Name' },
  { value: 'email', label: 'Email' },
  { value: 'company', label: 'Company' },
  ...
];

// 3. Filter options based on query type
const filteredOptions = useMemo(() => {
  const isNumeric = /^\d+$/.test(searchQuery.trim());
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(searchQuery.trim());

  return SEARCH_FIELD_OPTIONS.filter(option => {
    if (option.value === 'id' && !isNumeric) return false;
    if (option.value === 'email' && !isEmail) return false;
    return true;
  });
}, [searchQuery]);

// 4. Show search options while typing
{isSearching && searchQuery.trim() && (
  <IonList inset mode="ios">
    {filteredOptions.map((option) => (
      <IonItem
        key={option.value}
        button
        onClick={() => handleSearchSubmit(option.value)}
      >
        <IonLabel>{searchQuery}</IonLabel>
        <IonBadge mode="ios" slot="end">{option.label}</IonBadge>
      </IonItem>
    ))}
  </IonList>
)}
```

### Backend Implementation

```php
// In Repository
public function list(?string $search = null, ?string $searchField = 'all', ...): Paginator
{
    $query = Model::with(['relations'])
        ->orderByDesc('id');

    if ($search) {
        // Normalize search term (remove spaces for fuzzy matching)
        $normalizedSearch = str_replace(' ', '', $search);

        $query->where(function ($q) use ($search, $normalizedSearch, $searchField) {
            switch ($searchField) {
                case 'id':
                    $q->where('id', $search);
                    break;

                case 'email':
                    $q->where('email', 'LIKE', "%{$search}%");
                    break;

                case 'company':
                    // Fuzzy search: match with and without spaces
                    $q->where(function ($cq) use ($search, $normalizedSearch) {
                        $cq->where('company', 'LIKE', "%{$search}%")
                            ->orWhereRaw('REPLACE(company, " ", "") LIKE ?', ["%{$normalizedSearch}%"]);
                    });
                    break;

                case 'name':
                    // Search across multiple name fields
                    $q->where(function ($nq) use ($search) {
                        $nq->where('firstname', 'LIKE', "%{$search}%")
                            ->orWhere('lastname', 'LIKE', "%{$search}%")
                            ->orWhereRaw('CONCAT(firstname, " ", lastname) LIKE ?', ["%{$search}%"]);
                    });
                    break;

                case 'all':
                default:
                    // Search across all fields with fuzzy matching where applicable
                    $q->where('id', 'LIKE', "%{$search}%")
                        ->orWhere(function ($cq) use ($search, $normalizedSearch) {
                            $cq->where('company', 'LIKE', "%{$search}%")
                                ->orWhereRaw('REPLACE(company, " ", "") LIKE ?', ["%{$normalizedSearch}%"]);
                        })
                        ->orWhere('email', 'LIKE', "%{$search}%")
                        // ... other fields
                        ;
                    break;
            }
        });
    }

    return $query->simplePaginate();
}
```

### Controller Implementation

```php
public function index(Request $request): JsonResponse
{
    $search = $request->query('search');
    $searchField = $request->query('search_field', 'all');

    $results = $this->repository->list($search, $searchField);

    return response()->json(
        paginated(Resource::collection($results), 'items', true)
    );
}
```

## Component-Specific Examples

### AddressList
- **Fields**: id, masterLocationId, company, personName, address1, city, state
- **Special Rules**:
  - ID fields only show for numeric queries
  - Person name searches firstname and lastname
  - Fuzzy matching on company names

### CustomerSelectModal
- **Fields**: id, name, company, email
- **Special Rules**:
  - ID field only shows for numeric queries
  - Email field only shows for email-format queries
  - Name searches firstname and lastname concatenated
  - Fuzzy matching on company names

### OrderList
- **Fields**: id, reference, customer, email, product
- **Special Rules**:
  - ID/Reference only show for numeric queries
  - Email only shows for email-format queries
  - Product search includes SKU and name

## User Experience Flow

1. **User starts typing** → Shows available search field options
2. **User selects a field** (or presses Enter for default) → Executes search
3. **Results filtered** → Only matching records shown
4. **URL updates** → Search params saved to URL
5. **User can navigate back** → Previous search restored from URL

## Validation Helpers

```typescript
// Numeric check
const isNumeric = (str: string): boolean => /^\d+$/.test(str.trim());

// Email format check
const isEmail = (str: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());

// Normalize for fuzzy matching
const normalize = (str: string): string => str.replace(/\s+/g, '').toLowerCase();
```

## Benefits

1. ✅ **Intuitive**: Users see relevant search options based on what they're typing
2. ✅ **Flexible**: Fuzzy matching handles variations in data entry
3. ✅ **Fast**: Field-specific searches use database indexes efficiently
4. ✅ **Persistent**: URL state allows bookmarking and sharing
5. ✅ **Consistent**: Same pattern across all search interfaces

## Migration Checklist

When adding search to a new component:

- [ ] Define SearchField type for the entity
- [ ] Create SEARCH_FIELD_OPTIONS array
- [ ] Implement filtered options based on query type
- [ ] Add URL state management (useHistory, useLocation)
- [ ] Create search options UI (while typing)
- [ ] Update backend repository with fuzzy matching
- [ ] Update backend controller to accept search_field param
- [ ] Test numeric, email, and text queries
- [ ] Test fuzzy matching with spaces/special chars
- [ ] Test URL state persistence
