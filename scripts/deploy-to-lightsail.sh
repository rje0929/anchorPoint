#!/bin/bash
# Automated deployment script for Anchor Point to AWS Lightsail

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Configuration
INSTANCE_IP="${1:-$(cd "$PROJECT_ROOT/pulumi" 2>/dev/null && pulumi stack output instancePublicIp 2>/dev/null)}"
SSH_KEY="$PROJECT_ROOT/pulumi/anchorpoint-key.pem"

if [ -z "$INSTANCE_IP" ]; then
    echo -e "${RED}Error: Instance IP not found. Either:${NC}"
    echo "  1. Run: pulumi up in the pulumi folder first"
    echo "  2. Pass IP as argument: ./deploy-to-lightsail.sh 54.162.28.37"
    exit 1
fi

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Deploying Anchor Point to Lightsail${NC}"
echo -e "${GREEN}Instance IP: $INSTANCE_IP${NC}"
echo -e "${GREEN}=========================================${NC}\n"

# Step 1: Package the code
echo -e "${YELLOW}[1/6] Packaging code...${NC}"
cd "$PROJECT_ROOT"
tar --exclude='node_modules' \
    --exclude='.git' \
    --exclude='dist' \
    --exclude='pulumi' \
    --exclude='playwright' \
    --exclude='*.tar.gz' \
    --exclude='.env' \
    -czf anchorpoint-deploy.tar.gz .
echo -e "${GREEN}✓ Code packaged${NC}\n"

# Step 2: Upload code
echo -e "${YELLOW}[2/6] Uploading code to server...${NC}"
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no anchorpoint-deploy.tar.gz ubuntu@$INSTANCE_IP:~/
echo -e "${GREEN}✓ Code uploaded${NC}\n"

# Step 3: Extract and setup on server
echo -e "${YELLOW}[3/6] Extracting code on server...${NC}"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ubuntu@$INSTANCE_IP << 'ENDSSH'
set -e
sudo chown -R ubuntu:ubuntu /opt/anchorpoint
cd /opt/anchorpoint
tar -xzf ~/anchorpoint-deploy.tar.gz
rm ~/anchorpoint-deploy.tar.gz
echo "✓ Code extracted"
ENDSSH
echo -e "${GREEN}✓ Code extracted${NC}\n"

# Step 4: Install dependencies and build
echo -e "${YELLOW}[4/6] Installing dependencies and building...${NC}"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ubuntu@$INSTANCE_IP << 'ENDSSH'
set -e
cd /opt/anchorpoint

# Install dependencies
npm install --production=false

# Generate Prisma client
npx prisma generate

# Clean dist folder to ensure fresh build with current env variables
rm -rf dist

# Build frontend
npm run build

echo "✓ Build complete"
ENDSSH
echo -e "${GREEN}✓ Build complete${NC}\n"

# Step 5: Create/update serve-frontend.js
echo -e "${YELLOW}[5/6] Setting up frontend server...${NC}"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ubuntu@$INSTANCE_IP << 'ENDSSH'
set -e
cat > /opt/anchorpoint/serve-frontend.js << 'EOF'
const express = require('express');
const path = require('path');
const app = express();

const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

// Serve static files
app.use(express.static(distPath));

// Catch-all handler for SPA routing
app.use((req, res) => {
  res.sendFile(indexPath);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Frontend serving on port ${PORT}`);
});
EOF
echo "✓ Frontend server configured"
ENDSSH
echo -e "${GREEN}✓ Frontend server configured${NC}\n"

# Step 6: Restart services
echo -e "${YELLOW}[6/6] Restarting services...${NC}"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ubuntu@$INSTANCE_IP << 'ENDSSH'
set -e
cd /opt/anchorpoint

# Restart backend
pm2 delete anchorpoint-api || true
pm2 start server/index.ts --name anchorpoint-api --interpreter tsx

# Restart frontend
pm2 delete anchorpoint-frontend || true
pm2 start serve-frontend.js --name anchorpoint-frontend

# Save PM2 configuration
pm2 save

# Show status
pm2 status

echo "✓ Services restarted"
ENDSSH
echo -e "${GREEN}✓ Services restarted${NC}\n"

# Cleanup
rm -f anchorpoint-deploy.tar.gz

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Deployment complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo -e "\n${GREEN}Your application is live at:${NC}"
echo -e "${GREEN}http://$INSTANCE_IP${NC}\n"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Make sure your .env file is configured on the server"
echo -e "2. Set up a domain name (optional)"
echo -e "3. Configure SSL with Let's Encrypt (optional)\n"
