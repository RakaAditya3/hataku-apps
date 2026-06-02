#!/bin/sh
set -e

if [ ! -f vendor/autoload.php ]; then
    composer install --no-interaction --prefer-dist --optimize-autoloader
fi

if [ ! -f .env ]; then
    cp .env.example .env
    php artisan key:generate --no-interaction
fi

php artisan storage:link --force 2>/dev/null || true

php artisan migrate --force --no-interaction 2>/dev/null || true

# Start Laravel scheduler in background
php artisan schedule:work &

exec php artisan serve --host=0.0.0.0 --port=8000
