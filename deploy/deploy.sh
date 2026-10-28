#!/usr/bin/env bash
# Despliegue en el servidor del CIFP Tony Gallardo.
#   Uso:  MIS_SSH_KEY=/ruta/a/servidor-apps.key ./deploy/deploy.sh
# Compila el frontend, sube frontend + API y conserva /data (BD y ficheros subidos).
set -euo pipefail

HOST="${MIS_HOST:-ubuntu@129.151.249.242}"
KEY="${MIS_SSH_KEY:-$HOME/OneDrive/Documentos/Oracle/servidor-apps.key}"
DEST="${MIS_DEST:-/var/www/html/materialesis}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PKG="$(mktemp -d)/materialesis.tgz"

echo "→ Compilando frontend…"
(cd "$ROOT/frontend" && npm ci --silent && npm run build --silent)

echo "→ Empaquetando…"
STAGE="$(mktemp -d)"
cp -r "$ROOT/dist/." "$STAGE/"
mkdir -p "$STAGE/api"
cp -r "$ROOT/api/." "$STAGE/api/"
rm -f "$STAGE/api/config.local.php"
(cd "$STAGE" && tar czf "$PKG" .)

echo "→ Subiendo a $HOST…"
scp -q -i "$KEY" "$PKG" "$HOST:/tmp/materialesis.tgz"

ssh -i "$KEY" "$HOST" "DEST='$DEST' bash -s" <<'REMOTE'
set -euo pipefail
STAGE=$(mktemp -d)
tar xzf /tmp/materialesis.tgz -C "$STAGE"
sudo mkdir -p "$DEST/data/uploads"
# Sincroniza el código sin tocar los datos ni la configuración local
sudo rsync -a --delete --exclude 'data/' --exclude 'api/config.local.php' "$STAGE/" "$DEST/"
echo 'Require all denied' | sudo tee "$DEST/data/.htaccess" > /dev/null
sudo chown -R www-data:www-data "$DEST"
sudo find "$DEST" -type d -exec chmod 755 {} +
sudo find "$DEST" -type f -exec chmod 644 {} +
sudo chmod 750 "$DEST/data" "$DEST/data/uploads"
rm -rf "$STAGE" /tmp/materialesis.tgz
echo "✓ Desplegado en $DEST"
REMOTE

echo "✓ Listo: https://myappsserver.duckdns.org/materialesis/"
