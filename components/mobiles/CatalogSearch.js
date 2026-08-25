'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import styles from './CatalogSearch.module.css';

export default function CatalogSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(currentQuery);
  const isFirstRender = useRef(true);

  // Synchronize local state if URL changes externally
  useEffect(() => {
    setQuery(currentQuery);
  }, [currentQuery]);

  // Debounced URL updates (350ms)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = query.trim();

      if (trimmed) {
        params.set('q', trimmed);
      } else {
        params.delete('q');
      }

      const queryString = params.toString();
      const targetUrl = queryString ? `/mobiles?${queryString}` : '/mobiles';
      router.replace(targetUrl, { scroll: false });
    }, 350);

    return () => clearTimeout(timer);
  }, [query, router, searchParams]);

  const handleClear = () => {
    setQuery('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    const queryString = params.toString();
    router.replace(queryString ? `/mobiles?${queryString}` : '/mobiles', {
      scroll: false,
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className={styles.searchBox}>
      <Search size={20} className={styles.searchIcon} aria-hidden="true" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search by name or brand..."
        aria-label="Search mobiles"
        className={styles.searchInput}
      />
      {query.length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          className={styles.clearBtn}
          aria-label="Clear search"
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
