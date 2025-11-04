// CUSTOM: Unit tests for mock data generation
import { getMockData, regenerateMockData } from '../mockData';
import { formatNumber, formatTime, sortDomains } from '../utils';

describe('Mock Data Generation', () => {
  test('should generate 10 domains', () => {
    const data = getMockData();
    expect(data.domains).toHaveLength(10);
  });

  test('should have valid domain structure', () => {
    const data = getMockData();
    const domain = data.domains[0];

    expect(domain).toHaveProperty('id');
    expect(domain).toHaveProperty('domain');
    expect(domain).toHaveProperty('name');
    expect(domain).toHaveProperty('pageviews');
    expect(domain).toHaveProperty('visits');
    expect(domain).toHaveProperty('visitors');
    expect(domain).toHaveProperty('timeSeries');
    expect(domain.timeSeries).toHaveLength(28);
  });

  test('should have aggregated metrics', () => {
    const data = getMockData();

    expect(data.totals).toHaveProperty('pageviews');
    expect(data.totals).toHaveProperty('visits');
    expect(data.totals).toHaveProperty('visitors');
    expect(data.totals).toHaveProperty('realtimeTotal');
    expect(data.totals).toHaveProperty('timeSeries');
  });

  test('should have available tags', () => {
    const data = getMockData();
    expect(data.availableTags.length).toBeGreaterThan(0);
  });

  test('should format numbers correctly', () => {
    expect(formatNumber(1234)).toBe('1.2k');
    expect(formatNumber(1234567)).toBe('1.2M');
    expect(formatNumber(999)).toBe('999');
  });

  test('should format time correctly', () => {
    expect(formatTime(45)).toBe('45s');
    expect(formatTime(65)).toBe('1m 5s');
    expect(formatTime(120)).toBe('2m');
  });

  test('should sort domains correctly', () => {
    const data = getMockData();

    const sortedAsc = sortDomains(data.domains, 'name_asc');
    expect(sortedAsc[0].name.localeCompare(sortedAsc[1].name)).toBeLessThanOrEqual(0);

    const sortedByVisitors = sortDomains(data.domains, 'visitors_desc');
    expect(sortedByVisitors[0].visitors.current).toBeGreaterThanOrEqual(
      sortedByVisitors[1].visitors.current,
    );
  });

  test('should regenerate different data', () => {
    const data1 = getMockData();
    const data2 = regenerateMockData();

    // Should have different values (very unlikely to be the same)
    expect(data1.domains[0].visitors.current).not.toBe(data2.domains[0].visitors.current);
  });
});
