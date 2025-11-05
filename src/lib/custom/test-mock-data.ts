// CUSTOM: Test script for mock data generation
// Run with: node --loader ts-node/esm test-mock-data.ts
/* eslint-disable no-console */

import { getMockData } from './mockData';
import { formatNumber, formatTime } from './utils';

console.log('Testing mock data generation...\n');

try {
  const data = getMockData();

  console.log('✅ Mock data generated successfully!');
  console.log(`\nDomains: ${data.domains.length}`);
  console.log(`Available tags: ${data.availableTags.length}`);
  console.log(`Total visitors: ${formatNumber(data.totals.visitors)}`);
  console.log(`Total pageviews: ${formatNumber(data.totals.pageviews)}`);
  console.log(`Total visits: ${formatNumber(data.totals.visits)}`);
  console.log(`Realtime total: ${data.totals.realtimeTotal}`);

  console.log('\nFirst 3 domains:');
  data.domains.slice(0, 3).forEach((domain, i) => {
    console.log(`\n${i + 1}. ${domain.name} (${domain.domain})`);
    console.log(
      `   Visitors: ${formatNumber(domain.visitors.current)} (${
        domain.visitors.change > 0 ? '+' : ''
      }${domain.visitors.change}%)`,
    );
    console.log(
      `   Pageviews: ${formatNumber(domain.pageviews.current)} (${
        domain.pageviews.change > 0 ? '+' : ''
      }${domain.pageviews.change}%)`,
    );
    console.log(`   Avg Time: ${formatTime(domain.avgTime.current)}`);
    console.log(`   Tags: ${domain.tags.join(', ')}`);
    console.log(`   Favorite: ${domain.isFavorite ? 'Yes' : 'No'}`);
    console.log(`   Realtime: ${domain.realtimeVisitors} visitors`);
    console.log(`   Time Series: ${domain.timeSeries.length} data points`);
  });

  console.log('\n✅ All tests passed!');
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}
