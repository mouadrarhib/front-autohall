import { describe, expect, it, vi } from 'vitest';
import { exportRowsToCsv } from './csvExport';

describe('exportRowsToCsv', () => {
  it('creates a downloadable CSV file with escaped values', async () => {
    const createObjectURLMock = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:mock-url');
    const revokeObjectURLMock = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

    const anchor = document.createElement('a');
    const clickSpy = vi.spyOn(anchor, 'click').mockImplementation(() => undefined);
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(anchor);

    exportRowsToCsv({
      fileName: 'report.csv',
      rows: [{ name: 'ACME "Auto"', amount: 1200 }],
      columns: [
        { header: 'Name', accessor: (row) => row.name },
        { header: 'Amount', accessor: (row) => row.amount },
      ],
    });

    expect(createObjectURLMock).toHaveBeenCalledTimes(1);
    expect(anchor.download).toBe('report.csv');
    expect(anchor.href).toBe('blob:mock-url');
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-url');
    expect(createElementSpy).toHaveBeenCalledWith('a');

    createElementSpy.mockRestore();
  });
});
