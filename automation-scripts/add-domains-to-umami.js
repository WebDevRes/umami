#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

/**
 * Скрипт для массового добавления доменов в Umami
 *
 * Использование:
 * node add-domains-to-umami.js
 *
 * Входной файл: domains.txt (список доменов, каждый с новой строки)
 * Выходной файл: domains-with-ids.csv (формат: domain.com;website-id)
 */

// Конфигурация
const CONFIG = {
  UMAMI_URL: process.env.UMAMI_URL || 'https://woolworthscasino.com',
  USERNAME: process.env.UMAMI_USERNAME || 'admin',
  PASSWORD: process.env.UMAMI_PASSWORD || 'kentuci2930',
  INPUT_FILE: process.env.INPUT_FILE || 'domains.txt',
  OUTPUT_FILE: process.env.OUTPUT_FILE || 'domains-with-ids.csv',
  TEAM_ID: process.env.TEAM_ID || '058b0672-8101-4d28-8b1d-b44dd82c93c1',
  SKIP_TEAM: process.env.SKIP_TEAM === 'true',
};

// Проверка конфигурации
function validateConfig() {
  const errors = [];

  if (!CONFIG.UMAMI_URL) {
    errors.push('UMAMI_URL не указан');
  }

  if (!CONFIG.USERNAME) {
    errors.push('UMAMI_USERNAME не указан');
  }

  if (!CONFIG.PASSWORD) {
    errors.push('UMAMI_PASSWORD не указан');
  }

  if (!fs.existsSync(CONFIG.INPUT_FILE)) {
    errors.push(`Входной файл ${CONFIG.INPUT_FILE} не найден`);
  }

  if (errors.length > 0) {
    console.error('Ошибки конфигурации:');
    errors.forEach(err => console.error(`  - ${err}`));
    console.error('\nИспользуйте переменные окружения или создайте .env файл:');
    console.error('  UMAMI_URL=http://your-umami-server.com');
    console.error('  UMAMI_USERNAME=admin');
    console.error('  UMAMI_PASSWORD=your-password');
    console.error('  INPUT_FILE=domains.txt');
    console.error('  OUTPUT_FILE=domains-with-ids.csv');
    process.exit(1);
  }
}

// Логин в Umami и получение токена
async function login() {
  console.log('Авторизация в Umami...');

  const response = await fetch(`${CONFIG.UMAMI_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: CONFIG.USERNAME,
      password: CONFIG.PASSWORD,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ошибка авторизации: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.token) {
    throw new Error('Токен не получен');
  }

  console.log('✓ Авторизация успешна');
  return data.token;
}

// Создание сайта в Umami
async function createWebsite(token, domain, teamId = null) {
  const body = {
    name: domain,
    domain: domain,
  };

  // Если указан teamId, добавляем его в запрос
  if (teamId) {
    body.teamId = teamId;
  }

  const response = await fetch(`${CONFIG.UMAMI_URL}/api/websites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ошибка создания сайта ${domain}: ${response.status} - ${errorText}`);
  }

  const website = await response.json();
  return website.id;
}

// Чтение доменов из файла
async function readDomains() {
  const domains = [];
  const fileStream = fs.createReadStream(CONFIG.INPUT_FILE);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const domain = line.trim();
    if (domain && !domain.startsWith('#')) {
      domains.push(domain);
    }
  }

  return domains;
}

// Запись результатов в файл
function writeResults(results) {
  const content = results.map(r => `${r.domain};${r.id}`).join('\n');
  fs.writeFileSync(CONFIG.OUTPUT_FILE, content, 'utf8');
}

// Задержка
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Основная функция
async function main() {
  try {
    console.log('=== Массовое добавление доменов в Umami ===\n');

    validateConfig();

    const domains = await readDomains();
    console.log(`Найдено доменов: ${domains.length}\n`);

    if (domains.length === 0) {
      console.log('Нет доменов для обработки');
      return;
    }

    const token = await login();

    const results = [];
    const errors = [];

    console.log('\nДобавление доменов...\n');

    for (let i = 0; i < domains.length; i++) {
      const domain = domains[i];
      const progress = `[${i + 1}/${domains.length}]`;

      try {
        process.stdout.write(`${progress} ${domain}... `);

        // Создаем сайт с teamId (если не отключено)
        const teamId = CONFIG.SKIP_TEAM ? null : CONFIG.TEAM_ID;
        const websiteId = await createWebsite(token, domain, teamId);

        results.push({ domain, id: websiteId });

        if (teamId) {
          console.log(`✓ ${websiteId} (добавлен в команду)`);
        } else {
          console.log(`✓ ${websiteId}`);
        }

        // Небольшая задержка между запросами
        if (i < domains.length - 1) {
          await sleep(100);
        }
      } catch (error) {
        console.log(`✗ ${error.message}`);
        errors.push({ domain, error: error.message });
      }
    }

    // Запись результатов
    if (results.length > 0) {
      writeResults(results);
      console.log(`\n✓ Результаты сохранены в ${CONFIG.OUTPUT_FILE}`);
    }

    // Статистика
    console.log('\n=== Статистика ===');
    console.log(`Успешно добавлено: ${results.length}`);
    console.log(`Ошибок: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\nОшибки:');
      errors.forEach(({ domain, error }) => {
        console.log(`  ${domain}: ${error}`);
      });

      // Сохранение ошибок в отдельный файл
      const errorFile = 'domains-errors.txt';
      fs.writeFileSync(
        errorFile,
        errors.map(e => `${e.domain}\t${e.error}`).join('\n'),
        'utf8'
      );
      console.log(`\nОшибки сохранены в ${errorFile}`);
    }

  } catch (error) {
    console.error(`\nФатальная ошибка: ${error.message}`);
    process.exit(1);
  }
}

// Запуск
main();
