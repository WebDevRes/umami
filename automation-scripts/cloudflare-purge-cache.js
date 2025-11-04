#!/usr/bin/env node

const fs = require('fs');

/**
 * Скрипт для очистки кэша Cloudflare для всех доменов
 *
 * Использование:
 * CLOUDFLARE_EMAIL="your@email.com" \
 * CLOUDFLARE_API_KEY="your_api_key" \
 * node cloudflare-purge-cache.js
 */

const CONFIG = {
  EMAIL: process.env.CLOUDFLARE_EMAIL || '',
  API_KEY: process.env.CLOUDFLARE_API_KEY || '',
  INPUT_FILE: process.env.INPUT_FILE || 'domains-with-ids.csv',
};

// Получение Zone ID для домена
async function getZoneId(domain) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones?name=${domain}`,
    {
      headers: {
        'X-Auth-Email': CONFIG.EMAIL,
        'X-Auth-Key': CONFIG.API_KEY,
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await response.json();

  if (!data.success || data.result.length === 0) {
    throw new Error(`Zone не найдена для домена ${domain}`);
  }

  return data.result[0].id;
}

// Очистка кэша для конкретных файлов
async function purgeCache(domain, zoneId, scriptName) {
  const urls = [
    `https://${domain}/${scriptName}`,
    `http://${domain}/${scriptName}`,
  ];

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
    {
      method: 'POST',
      headers: {
        'X-Auth-Email': CONFIG.EMAIL,
        'X-Auth-Key': CONFIG.API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ files: urls }),
    }
  );

  const data = await response.json();

  if (!data.success) {
    throw new Error(`Ошибка очистки кэша: ${JSON.stringify(data.errors)}`);
  }

  return data;
}

// Чтение доменов
function readDomains() {
  if (!fs.existsSync(CONFIG.INPUT_FILE)) {
    throw new Error(`Файл ${CONFIG.INPUT_FILE} не найден`);
  }

  const content = fs.readFileSync(CONFIG.INPUT_FILE, 'utf8');
  const lines = content.trim().split('\n');

  return lines.map(line => {
    const [domain, id] = line.split(';').map(s => s.trim());
    const hash = id.replace(/-/g, '').substring(0, 8);
    return { domain, scriptName: `${hash}.js` };
  });
}

async function main() {
  console.log('=== Очистка кэша Cloudflare ===\n');

  if (!CONFIG.EMAIL || !CONFIG.API_KEY) {
    console.error('Ошибка: не указаны CLOUDFLARE_EMAIL или CLOUDFLARE_API_KEY');
    process.exit(1);
  }

  const sites = readDomains();
  console.log(`Найдено сайтов: ${sites.length}\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < sites.length; i++) {
    const { domain, scriptName } = sites[i];

    try {
      process.stdout.write(`[${i + 1}/${sites.length}] ${domain}... `);

      const zoneId = await getZoneId(domain);
      await purgeCache(domain, zoneId, scriptName);

      console.log(`✓ Кэш очищен`);
      success++;

      // Задержка между запросами
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.log(`✗ ${error.message}`);
      failed++;
    }
  }

  console.log('\n=== Статистика ===');
  console.log(`Успешно: ${success}`);
  console.log(`Ошибок: ${failed}`);
}

main().catch(error => {
  console.error(`\nФатальная ошибка: ${error.message}`);
  process.exit(1);
});
