#!/bin/bash

# Скрипт для добавления необходимых заголовков в существующие nginx конфигурации Umami

set -e

echo "=== Обновление nginx конфигураций для Umami ==="
echo ""

# Находим все конфиги с location = /api/send
configs=$(grep -rl "location = /api/send" /etc/nginx/fastpanel2-available/ 2>/dev/null || true)

if [ -z "$configs" ]; then
    echo "Конфигурации с Umami не найдены"
    exit 0
fi

echo "Найдено конфигураций: $(echo "$configs" | wc -l)"
echo ""

backup_dir="/root/nginx-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$backup_dir"
echo "Резервные копии сохраняются в: $backup_dir"
echo ""

updated=0
skipped=0

for config in $configs; do
    echo "Обработка: $config"

    # Создаем резервную копию
    cp "$config" "$backup_dir/$(basename $config)"

    # Проверяем, есть ли уже заголовки
    if grep -q "X-Real-IP" "$config" && grep -q "X-Forwarded-For" "$config"; then
        echo "  ⚠ Заголовки уже добавлены, пропускаем"
        ((skipped++))
        continue
    fi

    # Создаем временный файл
    temp_file=$(mktemp)

    # Обрабатываем файл
    awk '
        /location = \/api\/send {/ {
            print $0
            in_location = 1
            next
        }
        in_location && /proxy_set_header Host/ {
            print $0
            # Добавляем новые заголовки после Host
            print "        proxy_set_header X-Real-IP $remote_addr;"
            print "        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;"
            print "        proxy_set_header X-Forwarded-Proto $scheme;"
            in_location = 0
            next
        }
        { print $0 }
    ' "$config" > "$temp_file"

    # Заменяем оригинальный файл
    mv "$temp_file" "$config"

    echo "  ✓ Заголовки добавлены"
    ((updated++))
done

echo ""
echo "=== Результаты ==="
echo "Обновлено: $updated"
echo "Пропущено: $skipped"
echo ""

# Проверяем конфигурацию nginx
echo "Проверка конфигурации nginx..."
if nginx -t 2>&1 | tail -1; then
    echo ""
    echo "✓ Конфигурация корректна"
    echo ""
    read -p "Перезагрузить nginx? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        systemctl reload nginx
        echo "✓ Nginx перезагружен"
    else
        echo "⚠ Не забудьте перезагрузить nginx вручную: systemctl reload nginx"
    fi
else
    echo ""
    echo "✗ Ошибка в конфигурации nginx!"
    echo "Восстановите из резервной копии: $backup_dir"
    exit 1
fi

echo ""
echo "Готово!"
