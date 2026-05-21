# Order Managment Dashboard - Architecture Documentation

## Project Overview

This is a full-stack Order Managment dashboard application consisting of:
- **Frontend**: React + Ionic Framework (mobile-first PWA)
- **Backend**: Laravel PHP API

The application manages orders, products, customers, addresses, pages, posts, and team members for an Order Managment platform.

---

## Tech Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **UI Library**: Ionic Framework 8 (iOS/Android/Web)
- **Routing**: React Router v5
- **State Management**: TanStack React Query (server state)
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS + Ionic CSS Variables
- **Build Tool**: Vite
- **Swiper**: For segment/tab sliding
- **Editor**: Editor.js (block-based content editor)
- **Icons**: Ionicons + MDI (Material Design Icons)

### Backend
- **Framework**: Laravel (PHP)
- **Database**: MySQL/PostgreSQL
- **Authentication**: Laravel Sanctum
- **API Pattern**: RESTful JSON API

---

## Directory Structure

### Frontend (`/om-dashboard`)

```
src/
├── components/           # Reusable UI components
│   ├── UI/              # Generic UI components
│   ├── common/          # Shared components
│   ├── catalog/         # Catalog-specific components
│   ├── *Modal.tsx       # Modal components
│   └── Menu.tsx         # Navigation menu
├── contexts/            # React Context providers
│   └── AuthContext.tsx  # Authentication context
├── hooks/               # Custom React hooks
│   ├── use*.ts          # Data fetching hooks (React Query)
│   └── use*Modal.tsx    # Modal controller hooks
├── lib/                 # Utility libraries
│   └── Axios.ts         # Axios instance configuration
├── pages/               # Page components (routes)
│   ├── addresses/
│   ├── catalog/
│   ├── companies/
│   ├── customers/
│   ├── pages/
│   ├── posts/
│   └── team/
├── providers/           # Provider wrappers
│   └── QueryProvider.tsx
├── services/            # API service functions
│   └── *Service.ts
├── theme/               # Styling
│   └── variables.css    # Ionic CSS variables
└── types/               # TypeScript type definitions
    └── *.ts
```

### Backend (`/OMApi`)

```
app/
├── Http/
│   ├── Controllers/
│   │   └── Api/         # API controllers
│   ├── Requests/        # Form request validators
│   │   ├── Store*Request.php
│   │   └── Update*Request.php
│   └── Resources/       # API resources (transformers)
│       └── *Resource.php
├── Models/              # Eloquent models
│   └── *.php
└── Repositories/        # Data access layer
    └── *Repository.php

database/
└── migrations/          # Database migrations

routes/
└── api.php              # API route definitions
```

---

## Backend Architecture

### Repository Pattern

All data access goes through repositories. Controllers never access models directly.

```php
// app/Repositories/AreaRepository.php
class AreaRepository
{
    public function list($request)
    {
        return response()->json(
          paginated(AreaResource::collection(Area::orderByDesc('id')->paginate($request->per_page ?? 15)), 'areas'), 200
        );
    }

    public function store($request, $uuid = null)
    {
        $area = new Area;

        if ($uuid) {
            $area = Area::where('uuid', $uuid)->first();
            if (! $area) {
                return response()->json([
                    'success' => false,
                    'message' => 'Area not found',
                ], 404);
            }
        }

        // Assignment logic...
        $area->save();

        return response()->json([
            'success' => true,
            'data' => AreaResource::make($area),
            'message' => $uuid ? 'Area updated successfully' : 'Area created successfully',
        ], $uuid ? 200 : 201);
    }

    public function show(string $uuid)
    {
        $area = Area::where('uuid', $uuid)->first();

        if (! $area) {
            return response()->json([
                'success' => false,
                'message' => 'Area not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => AreaResource::make($area),
        ], 200);
    }

    public function destroy(string $uuid)
    {
        $area = Area::where('uuid', $uuid)->first();

        if (! $area) {
            return response()->json([
                'success' => false,
                'message' => 'Area not found',
            ], 404);
        }

        $area->delete();

        return response()->json([
            'success' => true,
            'message' => 'Area deleted',
        ], 204);
    }
}
```

### Form Requests

Validation and data transformation happen in Form Request classes.

```php
// app/Http/Requests/StorePostRequest.php
class StorePostRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'url' => ['required', 'string', 'max:500', 'unique:post,url'],
            'content' => ['nullable', 'string'],
            'postDate' => ['nullable', 'date'],
            'idAuthor' => ['nullable', 'integer', 'exists:employee,id'],
            'categoryIds' => ['nullable', 'array'],
            'categoryIds.*' => ['integer', 'exists:post_category,id'],
            'status' => ['nullable', 'in:draft,published,archived'],
            'metaTitle' => ['nullable', 'string', 'max:255'],
            'metaDescription' => ['nullable', 'string', 'max:500'],
            'metaKeywords' => ['nullable', 'string', 'max:500'],
        ];
    }

    // Transform camelCase to snake_case and build metadata
    public function validated($key = null, $default = null): array
    {
        $validated = parent::validated($key, $default);

        $metadata = [];
        if (!empty($validated['metaTitle'])) {
            $metadata['metaTitle'] = $validated['metaTitle'];
        }
        // ... more metadata fields

        return [
            'title' => ucfirst($validated['title']),
            'url' => $this->normalizeUrl($validated['url']),
            'content' => $validated['content'] ?? null,
            'post_date' => $validated['postDate'] ?? null,
            'id_author' => $validated['idAuthor'] ?? null,
            'category_ids' => $validated['categoryIds'] ?? [],
            'status' => $validated['status'] ?? 'draft',
            'metadata' => !empty($metadata) ? $metadata : null,
        ];
    }
}
```

### API Resources

Transform models to JSON responses with camelCase keys.

```php
// app/Http/Resources/PostResource.php
class PostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'url' => $this->url,
            'content' => $this->content,
            'postDate' => $this->post_date?->toDateString(),
            'status' => $this->status,
            'author' => $this->whenLoaded('author', function () {
                return $this->author ? [
                    'id' => $this->author->id,
                    'fullName' => $this->author->full_name,
                ] : null;
            }),
            'categories' => $this->whenLoaded('categories', function () {
                return $this->categories->map(fn($cat) => [
                    'id' => $cat->id,
                    'title' => $cat->title,
                ]);
            }),
            'metaTitle' => $this->meta_title,
            'metaDescription' => $this->meta_description,
            'metaKeywords' => $this->meta_keywords,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
```

### Controllers

Thin controllers that delegate to repositories.

```php
// app/Http/Controllers/Api/PostController.php
class PostController extends Controller
{
    public function __construct(
        private PostRepository $postRepository
    ) {}

    public function index(Request $request): JsonResponse
    {
        $posts = $this->postRepository->list(
            $request->query('search'),
            $request->query('status')
        );

        return response()->json(
            paginated(PostResource::collection($posts), 'posts', true)
        );
    }

    public function store(StorePostRequest $request): JsonResponse
    {
        $post = $this->postRepository->create($request->validated());

        return response()->json([
            'message' => 'Post created successfully',
            'post' => new PostResource($post),
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $post = $this->postRepository->findById($id);

        if (!$post) {
            return response()->json(['message' => 'Post not found'], 404);
        }

        return response()->json([
            'post' => new PostResource($post),
        ]);
    }

    public function update(UpdatePostRequest $request, int $id): JsonResponse
    {
        $post = $this->postRepository->findById($id);

        if (!$post) {
            return response()->json(['message' => 'Post not found'], 404);
        }

        $post = $this->postRepository->update($post, $request->validated());

        return response()->json([
            'message' => 'Post updated successfully',
            'post' => new PostResource($post),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $post = $this->postRepository->findById($id);

        if (!$post) {
            return response()->json(['message' => 'Post not found'], 404);
        }

        $this->postRepository->delete($post);

        return response()->json([
            'message' => 'Post deleted successfully',
        ]);
    }
}
```

### Metadata Pattern

Store flexible meta fields in a JSON `metadata` column with model accessors.

```php
// Model
protected $casts = [
    'metadata' => 'array',
];

public function getMetaTitleAttribute(): ?string
{
    return $this->metadata['metaTitle'] ?? null;
}

public function getMetaDescriptionAttribute(): ?string
{
    return $this->metadata['metaDescription'] ?? null;
}
```

### Soft Deletes

All main entities use soft deletes.

```php
use Illuminate\Database\Eloquent\SoftDeletes;

class Post extends Model
{
    use SoftDeletes;
}
```

---

## Frontend Architecture

### Type Definitions

All API responses and form data have TypeScript interfaces.

```typescript
// src/types/post.ts
export interface Post {
  id: number;
  title: string;
  url: string;
  content: string | null;
  postDate: string | null;
  status: 'draft' | 'published' | 'archived';
  author: PostAuthor | null;
  categories: PostCategorySimple[];
  categoryIds: number[];
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PostFormData {
  title: string;
  url: string;
  content?: string | null;
  postDate?: string | null;
  idAuthor?: number | null;
  categoryIds?: number[];
  status?: 'draft' | 'published' | 'archived';
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
}

export interface PostListResponse {
  posts: Post[];
  currentPage: number;
  nextPage: number | null;
}

export interface PostResponse {
  post: Post;
  message?: string;
}
```

### API Services

Typed service functions for API calls.

```typescript
// src/services/postService.ts
import { service } from '../lib/Axios';
import type { PostFormData, PostListResponse, PostResponse } from '../types/post';

export const postService = {
  async list(page = 1, search?: string, status?: string): Promise<PostListResponse> {
    const response = await service.get<PostListResponse>('/posts', {
      params: { page, search, status },
    });
    return response.data;
  },

  async show(id: number): Promise<PostResponse> {
    const response = await service.get<PostResponse>(`/posts/${id}`);
    return response.data;
  },

  async create(data: PostFormData): Promise<PostResponse> {
    const response = await service.post<PostResponse>('/posts', data);
    return response.data;
  },

  async update(id: number, data: Partial<PostFormData>): Promise<PostResponse> {
    const response = await service.put<PostResponse>(`/posts/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<MessageResponse> {
    const response = await service.delete<MessageResponse>(`/posts/${id}`);
    return response.data;
  },
};
```

### React Query Hooks

Data fetching with TanStack React Query for caching and infinite scroll.

```typescript
// src/hooks/usePosts.ts
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const QUERY_KEY = 'posts';

// Infinite scroll pagination
export function usePosts(search?: string, status?: string) {
  return useInfiniteQuery<PostListResponse>({
    queryKey: [QUERY_KEY, search, status],
    queryFn: ({ pageParam = 1 }) =>
      postService.list(pageParam as number, search, status),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });
}

// Single item fetch
export function usePost(id: number) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => postService.show(id),
    enabled: id > 0,
  });
}

// Mutations with cache invalidation
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PostFormData) => postService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PostFormData> }) =>
      postService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => postService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
```

### Modal Hook Pattern

Promise-based modal controllers for form modals and selection modals.

```typescript
// src/hooks/usePostFormModal.tsx
import { useState } from 'react';
import type { Post, PostFormData } from '../types/post';
import PostFormModal from '../components/PostFormModal';

interface PostFormOpenData {
  post?: Post | null;
}

type PostFormEvent =
  | { type: 'Saved'; data: PostFormData }
  | { type: 'Cancelled' };

export function usePostFormModal() {
  const [resolver, setResolver] = useState<((value: PostFormEvent) => void) | null>(null);
  const [state, setState] = useState<{
    isOpen: boolean;
    post: Post | null;
  }>({
    isOpen: false,
    post: null,
  });

  // Returns a promise that resolves when modal closes
  function openPostForm(data?: PostFormOpenData): Promise<PostFormEvent> {
    return new Promise((resolve) => {
      setResolver(() => resolve);
      setState({
        isOpen: true,
        post: data?.post || null,
      });
    });
  }

  function onClose() {
    if (state.isOpen) {
      setState({ isOpen: false, post: null });
      resolver?.({ type: 'Cancelled' });
    }
  }

  function onSave(data: PostFormData) {
    setState({ isOpen: false, post: null });
    resolver?.({ type: 'Saved', data });
  }

  // Render function for the modal
  function PostFormModalView() {
    return (
      <PostFormModal
        isOpen={state.isOpen}
        post={state.post}
        onClose={onClose}
        onSave={onSave}
      />
    );
  }

  return {
    openPostForm,
    PostFormModalView,
  };
}
```

**Usage in List Page:**

```typescript
function PostList() {
  const { openPostForm, PostFormModalView } = usePostFormModal();
  const createMutation = useCreatePost();

  async function handleAddNew() {
    const event = await openPostForm();

    if (event.type === 'Saved') {
      await createMutation.mutateAsync(event.data);
    }
  }

  async function handleEdit(post: Post) {
    const event = await openPostForm({ post });

    if (event.type === 'Saved') {
      await updateMutation.mutateAsync({ id: post.id, data: event.data });
    }
  }

  return (
    <IonPage>
      {/* ... list content */}
      <PostFormModalView />
    </IonPage>
  );
}
```

### Selection Modal Pattern

For selecting related entities (e.g., author, categories).

```typescript
// Single select (Author)
type AuthorSelectEvent =
  | { type: 'AuthorSelected'; data: { author: Employee } }
  | { type: 'Cleared' }
  | { type: 'Cancelled' };

// Multi-select (Categories)
type CategorySelectEvent =
  | { type: 'CategoriesSelected'; data: { categories: PostCategory[] } }
  | { type: 'Cancelled' };
```

### Segment Slider Pattern

For tabbed content with swipe navigation.

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

  return { swiper, setSwiper, onSegmentChange, onSlideChange, segment };
}
```

**Usage:**

```tsx
const SEGMENTS = ['Basic', 'Content', 'SEO'];

function PostFormModal() {
  const { setSwiper, onSegmentChange, onSlideChange, segment } =
    useSegmentSlider(SEGMENTS, 'Basic');

  return (
    <IonModal>
      <IonHeader>
        <IonToolbar>
          <IonSegment value={segment} onIonChange={onSegmentChange}>
            {SEGMENTS.map((seg) => (
              <IonSegmentButton key={seg} value={seg}>
                <IonLabel>{seg}</IonLabel>
              </IonSegmentButton>
            ))}
          </IonSegment>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <Swiper onSwiper={setSwiper} onSlideChange={onSlideChange}>
          <SwiperSlide>{/* Basic content */}</SwiperSlide>
          <SwiperSlide>{/* Content editor */}</SwiperSlide>
          <SwiperSlide>{/* SEO fields */}</SwiperSlide>
        </Swiper>
      </IonContent>
    </IonModal>
  );
}
```

### List Page Pattern

Standard list page with search, infinite scroll, and CRUD operations.

```tsx
function PostList() {
  const [search, setSearch] = useState('');

  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePosts(search || undefined);

  const createMutation = useCreatePost();
  const updateMutation = useUpdatePost();
  const deleteMutation = useDeletePost();
  const { openPostForm, PostFormModalView } = usePostFormModal();

  const posts = useMemo(() => {
    return data?.pages.flatMap((page) => page.posts) ?? [];
  }, [data]);

  function handleRefresh(event: CustomEvent<RefresherEventDetail>) {
    refetch().finally(() => event.detail.complete());
  }

  function handleInfiniteScroll(event: InfiniteScrollCustomEvent) {
    fetchNextPage().finally(() => event.target.complete());
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonMenuButton /></IonButtons>
          <IonTitle>Posts</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleAddNew}>Add New</IonButton>
          </IonButtons>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar
            value={search}
            onIonInput={(e) => setSearch(e.detail.value!)}
            debounce={300}
          />
        </IonToolbar>
      </IonHeader>
      <IonContent color="light">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <IonList mode="md" inset>
          {posts.map((post) => (
            <IonItem key={post.id} button onClick={() => handleEdit(post)}>
              <IonLabel>
                <h2>{post.title}</h2>
                <p>{post.url}</p>
              </IonLabel>
              <IonBadge slot="end">{post.status}</IonBadge>
            </IonItem>
          ))}
        </IonList>

        <IonInfiniteScroll
          onIonInfinite={handleInfiniteScroll}
          disabled={!hasNextPage || isFetchingNextPage}
        >
          <IonInfiniteScrollContent />
        </IonInfiniteScroll>

        <PostFormModalView />
      </IonContent>
    </IonPage>
  );
}
```

---

## API Response Formats

### List Response (Paginated)

```json
{
  "posts": [...],
  "currentPage": 1,
  "nextPage": 2
}
```

### Single Item Response

```json
{
  "post": {...},
  "message": "Post created successfully"
}
```

### Error Response

```json
{
  "message": "Post not found"
}
```

---

## Naming Conventions

### Backend (Laravel)
- **Tables**: `snake_case`, singular (e.g., `post`, `post_category`)
- **Columns**: `snake_case` (e.g., `id_author`, `post_date`)
- **Models**: `PascalCase`, singular (e.g., `Post`, `PostCategory`)
- **Controllers**: `PascalCase` + Controller (e.g., `PostController`)
- **Requests**: `Store*Request`, `Update*Request`
- **Resources**: `*Resource`
- **Repositories**: `*Repository`

### Frontend (React/TypeScript)
- **Files**: `PascalCase.tsx` for components, `camelCase.ts` for utilities
- **Types**: `PascalCase` for interfaces (e.g., `Post`, `PostFormData`)
- **Hooks**: `use*` prefix (e.g., `usePosts`, `usePostFormModal`)
- **Services**: `*Service` suffix (e.g., `postService`)
- **API Response Keys**: `camelCase` (transformed from snake_case)

---

## Database Patterns

### Foreign Key Naming
- `id_*` prefix (e.g., `id_author`, `id_post_category`)

### Pivot Tables
- `{table1}_{table2}_assigned` (e.g., `post_category_assigned`)

### Metadata Column
- JSON column named `metadata` for flexible data storage
- Access via model accessors

### Timestamps
- `created_at`, `updated_at` (Laravel defaults)
- `deleted_at` for soft deletes

---

## Authentication

### Backend
- Laravel Sanctum for API token authentication
- Admin auth routes: `/api/admin/login`, `/api/admin/logout`, `/api/admin/me`

### Frontend
- `AuthContext` provides `isAuthenticated`, `employee`, `login`, `logout`
- Protected routes wrapped in `<ProtectedRoute>` component
- Token stored in localStorage/cookies

---

## Editor.js Integration

Block-based content editor for Pages and Posts.

```typescript
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import ImageTool from '@editorjs/image';
import Embed from '@editorjs/embed';
import Quote from '@editorjs/quote';
import Delimiter from '@editorjs/delimiter';
import Table from '@editorjs/table';

// Initialize editor
editorRef.current = new EditorJS({
  holder: editorContainerRef.current,
  data: existingContent,
  tools: {
    header: { class: Header, config: { levels: [1, 2, 3, 4, 5, 6] } },
    list: { class: List, inlineToolbar: true },
    paragraph: { class: Paragraph, inlineToolbar: true },
    image: {
      class: ImageTool,
      config: {
        uploader: {
          // TODO: Implement S3 upload
          async uploadByFile(file: File) {
            // Upload to S3 and return URL
          },
        },
      },
    },
    embed: { class: Embed, config: { services: { youtube: true, vimeo: true } } },
    quote: { class: Quote, inlineToolbar: true },
    delimiter: Delimiter,
    table: { class: Table, inlineToolbar: true },
  },
});

// Save content as JSON
const outputData = await editorRef.current.save();
const content = JSON.stringify(outputData);
```

---

## File Structure for New Features

When adding a new feature (e.g., "Products"):

### Backend
1. `database/migrations/YYYY_MM_DD_HHMMSS_create_product_table.php`
2. `app/Models/Product.php`
3. `app/Repositories/ProductRepository.php`
4. `app/Http/Resources/ProductResource.php`
5. `app/Http/Requests/StoreProductRequest.php`
6. `app/Http/Requests/UpdateProductRequest.php`
7. `app/Http/Controllers/Api/ProductController.php`
8. Add routes in `routes/api.php`

### Frontend
1. `src/types/product.ts`
2. `src/services/productService.ts`
3. `src/hooks/useProducts.ts`
4. `src/hooks/useProductFormModal.tsx`
5. `src/components/ProductFormModal.tsx`
6. `src/pages/products/ProductList.tsx`
7. Add route in `src/App.tsx`
8. Add menu item in `src/components/Menu.tsx`

---

## Environment Configuration

### Frontend
- API base URL configured in `src/lib/Axios.ts`
- Environment variables via Vite (`.env` files)

### Backend
- Standard Laravel `.env` configuration
- Database, authentication, and API settings

---

## Common Ionic Components Used

- `IonPage`, `IonHeader`, `IonToolbar`, `IonContent`, `IonFooter`
- `IonList`, `IonItem`, `IonLabel`, `IonInput`, `IonTextarea`, `IonSelect`
- `IonModal`, `IonSegment`, `IonSegmentButton`
- `IonButton`, `IonButtons`, `IonMenuButton`, `IonBackButton`
- `IonSearchbar`, `IonRefresher`, `IonInfiniteScroll`
- `IonChip`, `IonBadge`, `IonToggle`, `IonCheckbox`
- `IonSpinner`, `IonText`
- `IonDatetime`, `IonDatetimeButton`
- `useIonToast`, `useIonAlert`

---

## Best Practices

1. **Always use repositories** for data access in backend
2. **Transform data in Form Requests** (camelCase → snake_case)
3. **Transform data in Resources** (snake_case → camelCase)
4. **Use React Query** for all server state
5. **Use modal hooks** for all modals to get promise-based control
6. **Invalidate queries** after mutations
7. **Use `mode="ios"` on IonList** for consistent styling
8. **Use `color="light"` on IonContent** for background color
9. **Use segments with Swiper** for tabbed forms
10. **Store meta fields in JSON metadata column** for flexibility
