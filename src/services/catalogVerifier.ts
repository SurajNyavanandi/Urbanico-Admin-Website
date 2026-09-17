/**
 * Urbanico Ecosystem - Backend Catalog Verification Utility
 * Logs the ultra-minimalistic verification format on the Admin Dashboard console
 * whenever data is loaded, refreshed, or synced from the backend.
 */

export async function verifyUrbanicoBackendCatalog(backendUrl: string = window.location.origin) {
  try {
    const readJson = async (response: Response) => {
      if (!response.ok) {
        throw new Error(`Catalog request failed with status ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Catalog endpoint returned a non-JSON response; check the backend URL');
      }

      return response.json();
    };

    const [catsRes, matsRes, servsRes] = await Promise.all([
      fetch(`${backendUrl}/api/materials/categories`).then(readJson),
      fetch(`${backendUrl}/api/materials`).then(readJson),
      fetch(`${backendUrl}/api/services`).then(readJson),
    ]);

    const categories: Array<{ id: string; name: string }> = catsRes.categories || [];
    const materials: Array<{ name: string; categoryId?: string; category?: string }> = matsRes.materials || [];
    const services: Array<{ name: string }> = servsRes.services || [];

    // Group materials by categoryId (excluding services)
    const catItemsMap: Record<string, string[]> = {};
    materials.forEach((m) => {
      const catId = m.categoryId || '';
      if (catId !== 'services') {
        if (!catItemsMap[catId]) {
          catItemsMap[catId] = [];
        }
        if (m.name && !catItemsMap[catId].includes(m.name)) {
          catItemsMap[catId].push(m.name);
        }
      }
    });

    const catSummary = categories
      .filter((c) => c.id !== 'services')
      .map((c) => {
        const items = catItemsMap[c.id] || [];
        return `  • ${c.name} (${items.length}): ${items.join(', ')}`;
      })
      .join('\n');

    const servSummary = services.map((s) => s.name).join(', ');

    console.log(
      `%c[Urbanico Backend Catalog]\n${catSummary}\n  • Services [No subcategories] (${services.length}): ${servSummary}`,
      'color: #059669; font-weight: 600;'
    );
  } catch (err) {
    console.warn('[Urbanico] Catalog verification log error:', err);
  }
}
