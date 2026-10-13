#!/usr/bin/env bash
set -euo pipefail

repo=/home/mojo/projects/ussysite6
backup="/home/mojo/web/deploy-backups/config-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$backup"
cp -a /etc/nginx/sites-available/ussy.host "$backup/ussy.host.available"
cp -a /etc/nginx/sites-enabled/ussy.host "$backup/ussy.host.enabled"

install -m 644 "$repo/deploy/ussysite6.service" /etc/systemd/system/ussysite6.service
systemctl daemon-reload
systemctl enable --now ussysite6.service

# Confirm the new backend before changing the live proxy.
curl --fail --silent --show-error --retry 5 --retry-connrefused --retry-delay 1 \
  http://127.0.0.1:3016/api/health

install -m 644 "$repo/deploy/nginx-ussy.host.conf" /etc/nginx/sites-available/ussy.host
install -m 644 "$repo/deploy/nginx-ussy.host.conf" /etc/nginx/sites-enabled/ussy.host
if ! nginx -t; then
  cp -a "$backup/ussy.host.available" /etc/nginx/sites-available/ussy.host
  cp -a "$backup/ussy.host.enabled" /etc/nginx/sites-enabled/ussy.host
  exit 1
fi
systemctl reload nginx
curl --fail --silent --show-error https://ussy.host/api/health
