#!/bin/sh
set -e

# Substitute only API_BACKEND_URL — leave nginx $variables untouched
envsubst '${API_BACKEND_URL}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

exec nginx -g 'daemon off;'
