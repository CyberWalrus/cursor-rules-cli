import { getCoreSystemInstructions } from '../get-core-system-instructions';

const mockGetSystemRulesFile = vi.hoisted(() => vi.fn());

vi.mock('../../system-rules-cache', () => ({
    getSystemRulesFile: mockGetSystemRulesFile,
}));

describe('getCoreSystemInstructions', () => {
    const content = '# Core System Principles\n\nSome content here.';

    beforeEach(() => {
        vi.clearAllMocks();
        mockGetSystemRulesFile.mockResolvedValue(content);
    });

    it('должен читать файл core-system-instructions.md', async () => {
        const result = await getCoreSystemInstructions();

        expect(mockGetSystemRulesFile).toHaveBeenCalledWith('core-system-instructions.md', false);
        expect(result).toBe(content);
    });
});
