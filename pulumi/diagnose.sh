#!/bin/bash
# Diagnostic script for anchorpoint deployment
# Run this on the server to diagnose connectivity issues

echo "=== System Info ==="
uname -a
echo ""

echo "=== Nginx Status ==="
sudo systemctl status nginx --no-pager
echo ""

echo "=== Nginx Config Test ==="
sudo nginx -t
echo ""

echo "=== PM2 Status ==="
pm2 status
echo ""

echo "=== Listening Ports ==="
sudo ss -tlnp | grep -E ':(80|443|3010|3000)\s'
echo ""

echo "=== Nginx Config ==="
cat /etc/nginx/sites-enabled/anchorpoint
echo ""

echo "=== Check if dist folder exists ==="
ls -la /opt/anchorpoint/dist/ 2>&1 | head -10
echo ""

echo "=== Check iptables rules ==="
sudo iptables -L -n | head -20
echo ""

echo "=== Test local connection to nginx ==="
curl -s -o /dev/null -w "%{http_code}" http://localhost/
echo " (HTTP status from localhost)"
echo ""

echo "=== Network interfaces ==="
ip addr show | grep -E 'inet |^[0-9]'
echo ""

echo "=== UFW Status (if installed) ==="
sudo ufw status 2>/dev/null || echo "UFW not installed"
echo ""
