import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('AuraLune Security Bundle & Secret Isolation Verification', () => {
  const rootDir = path.resolve(__dirname, '..');
  const srcDir = path.resolve(rootDir, 'src');
  const distDir = path.resolve(rootDir, 'dist');

  it('ensures SMSIR_API_KEY is never referenced in client-side src directory', () => {
    function scanDir(dir: string): string[] {
      let results: string[] = [];
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          results = results.concat(scanDir(fullPath));
        } else if (/\.(ts|tsx|js|jsx|json|html|css)$/.test(file)) {
          results.push(fullPath);
        }
      }
      return results;
    }

    const srcFiles = scanDir(srcDir);
    const forbiddenPatterns = [
      /SMSIR_API_KEY/i,
      /SUPABASE_SERVICE_ROLE_KEY/i,
      /service_role/i
    ];

    for (const filePath of srcFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      for (const pattern of forbiddenPatterns) {
        expect(content).not.toMatch(pattern);
      }
    }
  });

  it('ensures dist bundle (if present) contains no SMS.ir credentials or server secrets', () => {
    if (fs.existsSync(distDir)) {
      const distFiles = fs.readdirSync(distDir, { recursive: true }) as string[];
      for (const file of distFiles) {
        const fullPath = path.join(distDir, file);
        if (fs.statSync(fullPath).isFile() && /\.(js|html)$/.test(file)) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          expect(content).not.toContain('SMSIR_API_KEY');
          expect(content).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
        }
      }
    }
  });

  it('ensures .gitignore ignores sensitive environment files', () => {
    const gitignorePath = path.join(rootDir, '.gitignore');
    expect(fs.existsSync(gitignorePath)).toBe(true);
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
    expect(gitignoreContent).toMatch(/\.env(\.local)?/);
  });
});
