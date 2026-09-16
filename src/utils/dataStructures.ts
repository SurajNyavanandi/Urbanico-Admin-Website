// Fast O(1) index map creators and search utilities
export function createIndexMap<T, K extends keyof T>(items: T[], keyField: K): Map<T[K], T> {
  const map = new Map<T[K], T>();
  for (const item of items) {
    map.set(item[keyField], item);
  }
  return map;
}

export function groupBy<T, K extends keyof any>(items: T[], keyGetter: (item: T) => K): Record<K, T[]> {
  return items.reduce((acc, item) => {
    const key = keyGetter(item);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<K, T[]>);
}
