#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * Скрипт для автоматического развертывания Umami tracking кода на сайты в FastPanel
 *
 * Использование:
 * node deploy-tracking.js
 *
 * Входной файл: domains-with-ids.csv (формат: domain.com;website-id)
 *
 * Для каждого сайта:
 * 1. Генерирует уникальное имя JS файла (на основе website-id)
 * 2. Настраивает nginx редирект unique.js -> umami/script.js
 * 3. Внедряет код метрики во все HTML файлы
 * 4. Проверяет доступность метрики
 */

// Конфигурация
const CONFIG = {
  INPUT_FILE: process.env.INPUT_FILE || 'domains-with-ids.csv',
  UMAMI_SERVER: process.env.UMAMI_SERVER || 'https://analytics.yourdomain.com',
  FASTPANEL_SITES_DIR: process.env.FASTPANEL_SITES_DIR || '/var/www',
  NGINX_SITES_DIR: process.env.NGINX_SITES_DIR || '/etc/nginx/sites-available',
  DRY_RUN: process.env.DRY_RUN === 'true',
  SKIP_NGINX: process.env.SKIP_NGINX === 'true',
  SKIP_HTML: process.env.SKIP_HTML === 'true',
  SKIP_VERIFY: process.env.SKIP_VERIFY === 'true',
};

// Генерация уникального имени для скрипта на основе website ID
function generateScriptName(websiteId) {
  // Берем первые 8 символов ID и добавляем .js
  const hash = websiteId.replace(/-/g, '').substring(0, 8);
  return `${hash}.js`;
}

// Чтение CSV файла с доменами и ID
function readDomainsWithIds() {
  if (!fs.existsSync(CONFIG.INPUT_FILE)) {
    throw new Error(`Файл ${CONFIG.INPUT_FILE} не найден`);
  }

  const content = fs.readFileSync(CONFIG.INPUT_FILE, 'utf8');
  const lines = content.trim().split('\n');

  return lines.map(line => {
    const [domain, id] = line.split(';').map(s => s.trim());
    if (!domain || !id) {
      throw new Error(`Некорректная строка в файле: ${line}`);
    }
    return { domain, websiteId: id, scriptName: generateScriptName(id) };
  });
}

// Поиск конфигурационного файла nginx для домена
async function findNginxConfig(domain) {
  // FastPanel структура: /etc/nginx/fastpanel2-available/{user}/{domain}.conf
  try {
    const { stdout } = await execAsync(
      `grep -r "server_name ${domain}" /etc/nginx/fastpanel2-available/ 2>/dev/null | head -1 | cut -d: -f1`
    );
    const found = stdout.trim();
    if (found && fs.existsSync(found)) {
      return found;
    }
  } catch (error) {
    // Игнорируем ошибки
  }

  return null;
}

// Добавление редиректа в nginx конфиг
async function updateNginxConfig(configPath, scriptName, domain) {
  if (CONFIG.DRY_RUN) {
    console.log(`  [DRY RUN] Обновление nginx конфига: ${configPath}`);
    return;
  }

  let config = fs.readFileSync(configPath, 'utf8');

  // Проверяем, есть ли уже такой редирект
  if (config.includes(`location = /${scriptName}`)) {
    console.log(`  ⚠ Редирект для ${scriptName} уже существует`);
    return;
  }

  // Извлекаем хост из UMAMI_SERVER для proxy_set_header
  const umamiHost = CONFIG.UMAMI_SERVER.replace(/^https?:\/\//, '').replace(/\/$/, '');

  // Формируем редирект на Umami сервер
  const redirectBlock = `
    # Umami Analytics Tracking Script
    location = /${scriptName} {
        proxy_pass ${CONFIG.UMAMI_SERVER}/script.js;
        proxy_ssl_server_name on;
        proxy_set_header Host ${umamiHost};
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location = /api/send {
        proxy_pass ${CONFIG.UMAMI_SERVER}/api/send;
        proxy_ssl_server_name on;
        proxy_set_header Host ${umamiHost};
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
`;

  // Ищем блок server {} и вставляем редирект
  const serverBlockRegex = /(server\s*{[^}]*)(})/s;
  if (serverBlockRegex.test(config)) {
    config = config.replace(serverBlockRegex, `$1${redirectBlock}\n$2`);
  } else {
    throw new Error(`Не найден блок server {} в ${configPath}`);
  }

  // Сохраняем конфиг
  fs.writeFileSync(configPath, config, 'utf8');
  console.log(`  ✓ Nginx конфиг обновлен`);

  // Проверяем nginx и перезагружаем
  try {
    await execAsync('nginx -t');
    await execAsync('systemctl reload nginx');
    console.log(`  ✓ Nginx перезагружен`);
  } catch (error) {
    throw new Error(`Ошибка перезагрузки nginx: ${error.message}`);
  }
}

// Поиск директории сайта
async function findSiteDirectory(domain) {
  // FastPanel структура: /var/www/{user}/data/www/{domain}/
  try {
    const { stdout } = await execAsync(
      `find /var/www -maxdepth 4 -type d -path "*/data/www/${domain}" 2>/dev/null | head -1`
    );
    const found = stdout.trim();
    if (found && fs.existsSync(found)) {
      return found;
    }
  } catch (error) {
    // Игнорируем ошибки
  }

  return null;
}

// Рекурсивный поиск всех HTML файлов
function findHtmlFiles(dir) {
  const htmlFiles = [];

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        // Пропускаем служебные директории
        if (!['node_modules', '.git', 'vendor', 'cache'].includes(entry.name)) {
          walk(fullPath);
        }
      } else if (entry.isFile() && entry.name.match(/\.html?$/i)) {
        htmlFiles.push(fullPath);
      }
    }
  }

  walk(dir);
  return htmlFiles;
}

// Внедрение tracking кода в HTML файл
function injectTrackingCode(htmlPath, scriptName, websiteId) {
  const trackingCode = `<script defer src="/${scriptName}" data-website-id="${websiteId}"></script>`;

  let html = fs.readFileSync(htmlPath, 'utf8');

  // Проверяем, нет ли уже кода метрики
  if (html.includes('data-website-id') || html.includes(scriptName)) {
    return false; // Уже есть
  }

  // Пытаемся вставить перед </head>
  if (html.includes('</head>')) {
    html = html.replace('</head>', `  ${trackingCode}\n</head>`);
  }
  // Если нет </head>, вставляем перед </body>
  else if (html.includes('</body>')) {
    html = html.replace('</body>', `  ${trackingCode}\n</body>`);
  }
  // Если нет ни того, ни другого, добавляем в конец
  else {
    html += `\n${trackingCode}`;
  }

  if (!CONFIG.DRY_RUN) {
    fs.writeFileSync(htmlPath, html, 'utf8');
  }

  return true; // Добавлено
}

// Проверка доступности tracking скрипта
async function verifyTracking(domain, scriptName) {
  try {
    const url = `https://${domain}/${scriptName}`;
    const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });

    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    // Пробуем HTTP если HTTPS не работает
    try {
      const url = `http://${domain}/${scriptName}`;
      const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });

      if (response.ok) {
        return { success: true, warning: 'Работает только по HTTP' };
      }
    } catch {}

    return { success: false, error: error.message };
  }
}

// Обработка одного сайта
async function processSite(site) {
  const { domain, websiteId, scriptName } = site;

  console.log(`\n[${domain}]`);
  console.log(`  Website ID: ${websiteId}`);
  console.log(`  Script: ${scriptName}`);

  const result = {
    domain,
    success: true,
    steps: {},
  };

  try {
    // Шаг 1: Настройка Nginx
    if (!CONFIG.SKIP_NGINX) {
      const nginxConfig = await findNginxConfig(domain);

      if (!nginxConfig) {
        result.steps.nginx = { success: false, error: 'Конфиг не найден' };
        console.log(`  ✗ Nginx конфиг не найден`);
      } else {
        console.log(`  Конфиг: ${nginxConfig}`);
        await updateNginxConfig(nginxConfig, scriptName, domain);
        result.steps.nginx = { success: true };
      }
    }

    // Шаг 2: Внедрение в HTML
    if (!CONFIG.SKIP_HTML) {
      const siteDir = await findSiteDirectory(domain);

      if (!siteDir) {
        result.steps.html = { success: false, error: 'Директория не найдена' };
        console.log(`  ✗ Директория сайта не найдена`);
      } else {
        console.log(`  Директория: ${siteDir}`);
        const htmlFiles = findHtmlFiles(siteDir);
        console.log(`  Найдено HTML файлов: ${htmlFiles.length}`);

        let injected = 0;
        for (const htmlFile of htmlFiles) {
          if (injectTrackingCode(htmlFile, scriptName, websiteId)) {
            injected++;
          }
        }

        console.log(`  ✓ Код добавлен в ${injected} файлов`);
        result.steps.html = { success: true, injected, total: htmlFiles.length };
      }
    }

    // Шаг 3: Проверка
    if (!CONFIG.SKIP_VERIFY) {
      console.log(`  Проверка доступности...`);
      const verification = await verifyTracking(domain, scriptName);

      if (verification.success) {
        console.log(`  ✓ Tracking скрипт доступен`);
        if (verification.warning) {
          console.log(`  ⚠ ${verification.warning}`);
        }
      } else {
        console.log(`  ✗ Проверка не пройдена: ${verification.error}`);
      }

      result.steps.verify = verification;
    }

    console.log(`  ✓ Обработка завершена`);

  } catch (error) {
    console.log(`  ✗ Ошибка: ${error.message}`);
    result.success = false;
    result.error = error.message;
  }

  return result;
}

// Главная функция
async function main() {
  console.log('=== Развертывание Umami Tracking на FastPanel сайты ===\n');

  if (CONFIG.DRY_RUN) {
    console.log('⚠ РЕЖИМ DRY RUN - изменения не будут применены\n');
  }

  console.log('Конфигурация:');
  console.log(`  Umami сервер: ${CONFIG.UMAMI_SERVER}`);
  console.log(`  Директория сайтов: ${CONFIG.FASTPANEL_SITES_DIR}`);
  console.log(`  Nginx конфиги: ${CONFIG.NGINX_SITES_DIR}`);
  console.log();

  const sites = readDomainsWithIds();
  console.log(`Загружено сайтов: ${sites.length}\n`);

  const results = [];

  for (let i = 0; i < sites.length; i++) {
    const site = sites[i];
    console.log(`\n[${i + 1}/${sites.length}] Обработка ${site.domain}...`);

    const result = await processSite(site);
    results.push(result);

    // Небольшая задержка между сайтами
    if (i < sites.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Итоговая статистика
  console.log('\n\n=== Итоговая статистика ===');

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`Успешно: ${successful}`);
  console.log(`Ошибок: ${failed}`);

  if (failed > 0) {
    console.log('\nСайты с ошибками:');
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`  - ${r.domain}: ${r.error}`);
      });
  }

  // Сохранение отчета
  const reportPath = 'deployment-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\n✓ Отчет сохранен: ${reportPath}`);
}

// Запуск
if (require.main === module) {
  main().catch(error => {
    console.error(`\nФатальная ошибка: ${error.message}`);
    process.exit(1);
  });
}
