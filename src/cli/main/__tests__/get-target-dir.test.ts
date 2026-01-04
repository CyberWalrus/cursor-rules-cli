import { getTargetDir } from '../get-target-dir';

describe('getTargetDir', () => {
    it('должен возвращать текущую рабочую директорию через process.cwd()', () => {
        const result = getTargetDir();
        const expectedCwd = process.cwd();

        expect(result).toBe(expectedCwd);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
    });
});
