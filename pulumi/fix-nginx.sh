#!/bin/bash
# Fix nginx configuration to serve frontend directly instead of via PM2+serve
# Run this on the server after SSH'ing in

set -e

echo "Stopping PM2 frontend process if running..."
pm2 delete anchorpoint-frontend 2>/dev/null || true

echo "Backing up current nginx config..."
sudo cp /etc/nginx/sites-available/anchorpoint /etc/nginx/sites-available/anchorpoint.backup.$(date +%Y%m%d%H%M%S)

echo "Checking if SSL is configured..."
if [ -f /etc/letsencrypt/live/anchorpointresources.org/fullchain.pem ]; then
    echo "SSL is configured, creating HTTPS config..."
    sudo tee /etc/nginx/sites-available/anchorpoint > /dev/null << 'EOF'
server {
    listen 80;
    server_name anchorpointresources.org www.anchorpointresources.org;

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name anchorpointresources.org www.anchorpointresources.org;

    ssl_certificate /etc/letsencrypt/live/anchorpointresources.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/anchorpointresources.org/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Frontend - serve static files directly from dist
    root /opt/anchorpoint/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api {
        proxy_pass http://localhost:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
else
    echo "SSL not configured, creating HTTP-only config..."
    sudo tee /etc/nginx/sites-available/anchorpoint > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    # Frontend - serve static files directly from dist
    root /opt/anchorpoint/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api {
        proxy_pass http://localhost:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
fi

echo "Testing nginx configuration..."
sudo nginx -t

echo "Reloading nginx..."
sudo systemctl reload nginx

echo "Checking PM2 status..."
pm2 status

echo ""
echo "Done! Nginx is now serving the frontend directly."
echo "Check https://anchorpointresources.org to verify the site is working."
