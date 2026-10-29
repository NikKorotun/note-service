COMPOSE := docker compose -f devops/docker/docker-compose.yml
PHP     := $(COMPOSE) exec php-fpm
NODE    := $(COMPOSE) exec node
NGINX   := $(COMPOSE) exec nginx

# Аргументы для команд-обёрток: make artisan c="migrate:status"
c ?=

.DEFAULT_GOAL := help
.PHONY: help init env up down restart build rebuild ps logs \
        php node psql composer artisan migrate fresh test npm lint build-front

help: ## Показать список команд
	@awk 'BEGIN {FS = ":.*## "} /^[a-z-]+:.*## / {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

## Первый запуск

init: env build up ## Первый запуск: .env, сборка, зависимости, ключ, миграции
	$(PHP) composer install
	@grep -q '^APP_KEY=.\+' backend/.env || $(PHP) php artisan key:generate
	$(PHP) php artisan migrate --force
	@echo "Готово: http://localhost:$$(grep -E '^NGINX_PORT=' devops/docker/.env | cut -d= -f2)"

env: ## Создать .env из примеров и сгенерировать JWT_SECRET, если их ещё нет
	@test -f devops/docker/.env || { \
		sed -e 's/^UID=.*/UID=$(shell id -u)/' -e 's/^GID=.*/GID=$(shell id -g)/' \
			devops/docker/.env.example > devops/docker/.env; \
		echo "Создан devops/docker/.env"; }
	@test -f backend/.env || { cp backend/.env.example backend/.env; echo "Создан backend/.env"; }
	@# JwtService требует секрет не короче 32 байт; существующий не трогаем
	@grep -q '^JWT_SECRET=.\+' backend/.env || { \
		secret=$$(openssl rand -base64 48 | tr -d '\n'); \
		if grep -q '^JWT_SECRET=' backend/.env; then \
			sed -i.bak "s|^JWT_SECRET=.*|JWT_SECRET=$$secret|" backend/.env && rm backend/.env.bak; \
		else \
			echo "JWT_SECRET=$$secret" >> backend/.env; \
		fi; \
		echo "Сгенерирован JWT_SECRET"; }

## Контейнеры

up: ## Запустить проект в фоне
	$(COMPOSE) up -d

down: ## Остановить проект
	$(COMPOSE) down

restart: ## Перезапустить контейнеры
	$(COMPOSE) restart

build: ## Собрать образы
	$(COMPOSE) build

rebuild: ## Пересобрать образы без кэша и перезапустить
	$(COMPOSE) build --no-cache
	$(COMPOSE) up -d --force-recreate

ps: ## Статус контейнеров
	$(COMPOSE) ps

logs: ## Логи (все или одного сервиса: make logs c=node)
	$(COMPOSE) logs -f --tail=100 $(c)

## Консоли

php: ## Shell в контейнере php-fpm
	$(PHP) sh

node: ## Shell в контейнере node
	$(NODE) sh

psql: ## Консоль PostgreSQL
	$(COMPOSE) exec postgres sh -c 'psql -U "$$POSTGRES_USER" -d "$$POSTGRES_DB"'

nginx: ## Shell в контейнере nginx
	$(NGINX) sh

## Бэкенд

composer: ## Composer: make composer c="require foo/bar"
	$(PHP) composer $(c)

artisan: ## Artisan: make artisan c="route:list"
	$(PHP) php artisan $(c)

migrate: ## Применить миграции
	$(PHP) php artisan migrate

fresh: ## Пересоздать БД с сидами
	$(PHP) php artisan migrate:fresh --seed

test: ## Тесты бэкенда
	$(PHP) php artisan test $(c)

## Фронтенд

npm: ## npm: make npm c="install foo"
	$(NODE) npm $(c)

lint: ## Линтер фронтенда
	$(NODE) npm run lint

build-front: ## Production-сборка фронтенда
	$(NODE) npm run build
