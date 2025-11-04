#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция вывода с цветом
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Загрузка .env если существует
if [ -f .env ]; then
    print_info "Загружаю конфигурацию из .env"
    export $(cat .env | grep -v '^#' | xargs)
fi

# Функция для проверки Node.js
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js не установлен"
        exit 1
    fi
    print_success "Node.js $(node --version)"
}

# Меню выбора действия
show_menu() {
    echo ""
    echo "=============================================="
    echo "  Umami FastPanel Автоматизация"
    echo "=============================================="
    echo ""
    echo "1) Добавить домены в Umami"
    echo "2) Развернуть tracking код (с изменениями)"
    echo "3) Тестовый запуск развертывания (DRY RUN)"
    echo "4) Только настройка nginx"
    echo "5) Только внедрение в HTML"
    echo "6) Полный процесс (добавление + развертывание)"
    echo "7) Показать статус"
    echo "8) Выход"
    echo ""
    read -p "Выберите действие [1-8]: " choice
    echo ""
}

# Добавление доменов
add_domains() {
    print_info "Добавление доменов в Umami..."

    if [ ! -f "domains.txt" ]; then
        print_error "Файл domains.txt не найден"
        print_info "Создайте файл domains.txt со списком доменов"
        return 1
    fi

    local count=$(grep -v '^#' domains.txt | grep -v '^$' | wc -l)
    print_info "Найдено доменов: $count"

    if [ -z "$UMAMI_URL" ] || [ -z "$UMAMI_USERNAME" ] || [ -z "$UMAMI_PASSWORD" ]; then
        print_error "Не указаны UMAMI_URL, UMAMI_USERNAME или UMAMI_PASSWORD"
        print_info "Создайте .env файл или установите переменные окружения"
        return 1
    fi

    node add-domains-to-umami.js

    if [ $? -eq 0 ]; then
        print_success "Домены добавлены"
        if [ -f "domains-with-ids.csv" ]; then
            local added=$(wc -l < domains-with-ids.csv)
            print_success "Создан файл domains-with-ids.csv ($added строк)"
        fi
    else
        print_error "Ошибка при добавлении доменов"
        return 1
    fi
}

# Развертывание
deploy_tracking() {
    local dry_run=$1
    local skip_nginx=$2
    local skip_html=$3

    if [ ! -f "domains-with-ids.csv" ]; then
        print_error "Файл domains-with-ids.csv не найден"
        print_info "Сначала запустите добавление доменов (опция 1)"
        return 1
    fi

    local count=$(wc -l < domains-with-ids.csv)
    print_info "Найдено сайтов: $count"

    if [ "$dry_run" = "true" ]; then
        print_warning "РЕЖИМ DRY RUN - изменения не будут применены"
        export DRY_RUN=true
    fi

    if [ "$skip_nginx" = "true" ]; then
        export SKIP_NGINX=true
        print_info "Настройка nginx будет пропущена"
    fi

    if [ "$skip_html" = "true" ]; then
        export SKIP_HTML=true
        print_info "Внедрение в HTML будет пропущено"
    fi

    node deploy-tracking.js

    if [ $? -eq 0 ]; then
        print_success "Развертывание завершено"
        if [ -f "deployment-report.json" ]; then
            print_success "Создан файл deployment-report.json"

            # Подсчет успешных и неудачных
            local successful=$(grep -o '"success":true' deployment-report.json | wc -l)
            local failed=$(grep -o '"success":false' deployment-report.json | wc -l)

            echo ""
            print_success "Успешно: $successful"
            if [ $failed -gt 0 ]; then
                print_error "Ошибок: $failed"
            fi
        fi
    else
        print_error "Ошибка при развертывании"
        return 1
    fi
}

# Показать статус
show_status() {
    echo "=============================================="
    echo "  Статус"
    echo "=============================================="
    echo ""

    if [ -f "domains.txt" ]; then
        local count=$(grep -v '^#' domains.txt | grep -v '^$' | wc -l)
        print_success "domains.txt найден ($count доменов)"
    else
        print_warning "domains.txt не найден"
    fi

    if [ -f "domains-with-ids.csv" ]; then
        local count=$(wc -l < domains-with-ids.csv)
        print_success "domains-with-ids.csv найден ($count записей)"
    else
        print_warning "domains-with-ids.csv не найден"
    fi

    if [ -f "deployment-report.json" ]; then
        local successful=$(grep -o '"success":true' deployment-report.json | wc -l)
        local failed=$(grep -o '"success":false' deployment-report.json | wc -l)
        print_success "deployment-report.json найден"
        echo "    Успешно: $successful"
        if [ $failed -gt 0 ]; then
            echo "    Ошибок: $failed"
        fi
    else
        print_warning "deployment-report.json не найден"
    fi

    echo ""
    print_info "Конфигурация:"
    echo "    UMAMI_URL: ${UMAMI_URL:-не задан}"
    echo "    UMAMI_SERVER: ${UMAMI_SERVER:-не задан}"
    echo "    FASTPANEL_SITES_DIR: ${FASTPANEL_SITES_DIR:-/var/www}"
    echo "    NGINX_SITES_DIR: ${NGINX_SITES_DIR:-/etc/nginx/sites-available}"
    echo ""
}

# Главный цикл
main() {
    check_node

    while true; do
        show_menu

        case $choice in
            1)
                add_domains
                ;;
            2)
                deploy_tracking false false false
                ;;
            3)
                deploy_tracking true false false
                ;;
            4)
                deploy_tracking false false true
                ;;
            5)
                deploy_tracking false true false
                ;;
            6)
                add_domains
                if [ $? -eq 0 ]; then
                    echo ""
                    read -p "Продолжить с развертыванием? [y/N]: " confirm
                    if [[ $confirm =~ ^[Yy]$ ]]; then
                        deploy_tracking false false false
                    fi
                fi
                ;;
            7)
                show_status
                ;;
            8)
                print_info "Выход"
                exit 0
                ;;
            *)
                print_error "Неверный выбор"
                ;;
        esac

        echo ""
        read -p "Нажмите Enter для продолжения..."
    done
}

# Запуск
main
