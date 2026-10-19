import { describe, it, expect } from 'vitest';

/**
 * Logic extracted from public/404.html and index.html
 * to ensure SPA routing on custom domain (auralune.ir) does not loop or append ~and~ repeatedly.
 */
function transform404Url(urlStr: string, pathSegmentsToKeep: number): string | null {
  const l = new URL(urlStr);
  if (l.search && l.search[1] === '/') {
    return null; // Guard against recursive redirect loops
  }
  return (
    l.protocol +
    '//' +
    l.hostname +
    (l.port ? ':' + l.port : '') +
    l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') +
    '/?/' +
    l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
    (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
    l.hash
  );
}

function decodeIndexUrl(urlStr: string): string | null {
  const l = new URL(urlStr);
  if (l.search[1] === '/') {
    const decoded = l.search
      .slice(1)
      .split('&')
      .map((s) => s.replace(/~and~/g, '&'))
      .join('?');
    return l.pathname.slice(0, -1) + decoded + l.hash;
  }
  return null;
}

describe('GitHub Pages SPA Routing on custom domain (auralune.ir)', () => {
  const pathSegmentsToKeep = 0; // Configured for custom domain at root

  it('correctly redirects /admin directly without infinite loop', () => {
    const originalUrl = 'https://auralune.ir/admin';
    const redirectUrl = transform404Url(originalUrl, pathSegmentsToKeep);
    expect(redirectUrl).toBe('https://auralune.ir/?/admin');

    const restoredPath = decodeIndexUrl(redirectUrl!);
    expect(restoredPath).toBe('/admin');
  });

  it('correctly handles trailing slash /admin/', () => {
    const originalUrl = 'https://auralune.ir/admin/';
    const redirectUrl = transform404Url(originalUrl, pathSegmentsToKeep);
    expect(redirectUrl).toBe('https://auralune.ir/?/admin/');

    const restoredPath = decodeIndexUrl(redirectUrl!);
    expect(restoredPath).toBe('/admin/');
  });

  it('correctly handles nested admin subpaths and query strings', () => {
    const originalUrl = 'https://auralune.ir/admin/products?tab=edit&id=123#spec';
    const redirectUrl = transform404Url(originalUrl, pathSegmentsToKeep);
    expect(redirectUrl).toBe('https://auralune.ir/?/admin/products&tab=edit~and~id=123#spec');

    const restoredPath = decodeIndexUrl(redirectUrl!);
    expect(restoredPath).toBe('/admin/products?tab=edit&id=123#spec');
  });

  it('safely halts if URL already has ?/ prefix (loop prevention)', () => {
    const alreadyRedirected = 'https://auralune.ir/?/admin';
    const nextRedirect = transform404Url(alreadyRedirected, pathSegmentsToKeep);
    expect(nextRedirect).toBeNull();
  });
});
