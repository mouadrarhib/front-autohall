import { describe, expect, it } from 'vitest';
import { buildVentePayload, extractPaginationState, normalizeVente } from './VenteType';

describe('VenteType utilities', () => {
  it('normalizes mixed backend fields into a stable vente object', () => {
    const row = normalizeVente({
      VenteId: 12,
      TypeVenteId: 3,
      UserId: 42,
      IdFiliale: 7,
      IdSuccursale: 0,
      IdMarque: 5,
      IdModele: 9,
      IdVersion: 11,
      TypeVenteName: 'Direct',
      MarqueName: 'Peugeot',
      price: 123000,
      revenue: 246000,
      tmDirect: 12.5,
      Volume: 2,
      year: 2026,
      month: 1,
      Active: 1,
    });

    expect(row.id).toBe(12);
    expect(row.idTypeVente).toBe(3);
    expect(row.idUser).toBe(42);
    expect(row.idFiliale).toBe(7);
    expect(row.idSuccursale).toBeNull();
    expect(row.typeVenteName).toBe('Direct');
    expect(row.marqueName).toBe('Peugeot');
    expect(row.prixVente).toBe(123000);
    expect(row.chiffreAffaires).toBe(246000);
    expect(row.margePercentage).toBe(12.5);
    expect(row.active).toBe(true);
  });

  it('extracts pagination values from payload metadata', () => {
    const pagination = extractPaginationState({
      data: {
        pagination: {
          page: 2,
          pageSize: 50,
          totalCount: 126,
          totalPages: 3,
        },
      },
    });

    expect(pagination).toEqual({
      page: 2,
      pageSize: 50,
      totalRecords: 126,
      totalPages: 3,
    });
  });

  it('builds API payload with numeric conversions and nullable ids', () => {
    const payload = buildVentePayload({
      targetType: 'version',
      idTypeVente: '4',
      prixVente: '555.5',
      chiffreAffaires: '1111',
      volume: '2',
      venteYear: '2026',
      venteMonth: '2',
      idFiliale: '',
      idSuccursale: '10',
      idMarque: '8',
      idModele: '14',
      idVersion: '22',
      marge: '150',
      margePercentage: '12.5',
    });

    expect(payload).toEqual({
      idTypeVente: 4,
      prixVente: 555.5,
      chiffreAffaires: 1111,
      volume: 2,
      venteYear: 2026,
      venteMonth: 2,
      idFiliale: null,
      idSuccursale: 10,
      idMarque: 8,
      idModele: 14,
      idVersion: 22,
      marge: 150,
      margePercentage: 12.5,
    });
  });
});
