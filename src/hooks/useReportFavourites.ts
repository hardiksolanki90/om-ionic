import { useCallback, useMemo, useSyncExternalStore } from 'react';
import {
  isPredefinedFavourite,
  mergeCatalogFavourites,
  normalizeFavouriteSlug,
  REPORT_FAVOURITES_KEY,
  resolveUserFavourites,
} from '../lib/reporting/catalogGroups';

const EMPTY_FAVOURITES: string[] = [];

let cachedSerialized = '';
let cachedSnapshot: string[] = EMPTY_FAVOURITES;

function getSnapshot(): string[] {
  const raw = localStorage.getItem(REPORT_FAVOURITES_KEY);
  const serialized = raw ?? '';

  if (serialized === cachedSerialized) {
    return cachedSnapshot;
  }

  cachedSerialized = serialized;
  const next = resolveUserFavourites(raw);

  if (
    next.length === cachedSnapshot.length &&
    next.every((slug, i) => slug === cachedSnapshot[i])
  ) {
    return cachedSnapshot;
  }

  cachedSnapshot = next.length === 0 ? EMPTY_FAVOURITES : next;
  return cachedSnapshot;
}

function subscribe(onStoreChange: () => void): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key === REPORT_FAVOURITES_KEY || e.key === null) {
      cachedSerialized = '';
      onStoreChange();
    }
  };
  const onLocalChange = () => {
    cachedSerialized = '';
    onStoreChange();
  };
  window.addEventListener('storage', handler);
  window.addEventListener('report-favourites-changed', onLocalChange);
  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener('report-favourites-changed', onLocalChange);
  };
}

function persist(slugs: string[]): void {
  const serialized = JSON.stringify(slugs);
  localStorage.setItem(REPORT_FAVOURITES_KEY, serialized);
  cachedSerialized = serialized;
  cachedSnapshot = slugs.length === 0 ? EMPTY_FAVOURITES : slugs;
  window.dispatchEvent(new Event('report-favourites-changed'));
}

export function useReportFavourites() {
  const userFavourites = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => EMPTY_FAVOURITES,
  );

  const favourites = mergeCatalogFavourites(userFavourites);
  const favouriteSet = useMemo(() => new Set(favourites), [favourites]);

  const toggleFavourite = useCallback((slug: string) => {
    const normalized = normalizeFavouriteSlug(slug);
    if (isPredefinedFavourite(normalized)) {
      return;
    }

    const current = getSnapshot().map(normalizeFavouriteSlug);
    const next = current.includes(normalized)
      ? current.filter((s) => s !== normalized)
      : [...current, normalized];
    persist(next);
  }, []);

  const isFavourite = useCallback(
    (slug: string) => favouriteSet.has(normalizeFavouriteSlug(slug)),
    [favouriteSet],
  );

  return { favourites, toggleFavourite, isFavourite, isPredefinedFavourite };
}
