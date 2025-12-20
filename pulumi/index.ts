import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Configuration
const config = new pulumi.Config();
const appName = "anchorpoint";
const instanceSize = "medium_2_0"; // $10/month (1GB RAM, 2 vCPUs, 40GB SSD)
const region = aws.config.region || "us-east-1";

// Get the availability zone for the region
const availabilityZone = `${region}a`;

// Create an SSH key pair for instance access
const keyPair = new aws.lightsail.KeyPair(`${appName}-keypair`, {
    name: `${appName}-key`,
});

// Export the private key (store this securely!)
export const privateKey = keyPair.privateKey;

// User data script to set up the server
const userData = `#!/bin/bash
set -e

# Update system
apt-get update
apt-get upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install essential build tools
apt-get install -y build-essential git nginx certbot python3-certbot-nginx

# Install PM2 globally
npm install -g pm2

# Install tsx globally for running TypeScript
npm install -g tsx

# Create app directory
mkdir -p /opt/anchorpoint
cd /opt/anchorpoint

# Clone the repository (you'll need to replace this with your actual repo)
# For now, we'll expect the code to be uploaded separately
# git clone <your-repo-url> .

# Create a placeholder startup script
cat > /opt/anchorpoint/startup.sh << 'EOF'
#!/bin/bash
cd /opt/anchorpoint

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Build frontend
npm run build

# Start backend with PM2
pm2 delete anchorpoint-api || true
pm2 start server/index.ts --name anchorpoint-api --interpreter tsx -- --port 3010

# Serve frontend with PM2 (using serve package)
npm install -g serve
pm2 delete anchorpoint-frontend || true
pm2 start serve --name anchorpoint-frontend -- -s dist -l 3000

# Save PM2 configuration
pm2 save
pm2 startup
EOF

chmod +x /opt/anchorpoint/startup.sh

# Configure Nginx as reverse proxy
cat > /etc/nginx/sites-available/anchorpoint << 'EOF'
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # API
    location /api {
        proxy_pass http://localhost:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/anchorpoint /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
nginx -t
systemctl restart nginx
systemctl enable nginx

# Create deployment instructions
cat > /root/DEPLOYMENT_INSTRUCTIONS.txt << 'EOF'
ANCHOR POINT DEPLOYMENT INSTRUCTIONS
====================================

1. Upload your code to /opt/anchorpoint
2. Create .env file with your environment variables:
   cd /opt/anchorpoint
   nano .env

   Add:
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   DATABASE_URL=your_database_url
   PORT=3010
   VITE_APP_MAPBOX_ACCESS_TOKEN=your_mapbox_token

3. Run the startup script:
   /opt/anchorpoint/startup.sh

4. Check PM2 status:
   pm2 status
   pm2 logs

5. Set up SSL (after configuring your domain):
   certbot --nginx -d yourdomain.com -d www.yourdomain.com

EOF

echo "Server setup complete! Check /root/DEPLOYMENT_INSTRUCTIONS.txt for next steps."
`;

// Create the Lightsail instance
const instance = new aws.lightsail.Instance(`${appName}-instance`, {
    name: `${appName}-server`,
    availabilityZone: availabilityZone,
    blueprintId: "ubuntu_22_04",
    bundleId: instanceSize,
    keyPairName: keyPair.name,
    userData: userData,
    tags: {
        Name: appName,
        Environment: "production",
        ManagedBy: "pulumi",
    },
});

// Create and attach a static IP
const staticIp = new aws.lightsail.StaticIp(`${appName}-static-ip`, {
    name: `${appName}-ip`,
});

const staticIpAttachment = new aws.lightsail.StaticIpAttachment(`${appName}-ip-attachment`, {
    staticIpName: staticIp.name,
    instanceName: instance.name,
});

// Open firewall ports
const httpsPort = new aws.lightsail.InstancePublicPorts(`${appName}-https`, {
    instanceName: instance.name,
    portInfos: [{
        protocol: "tcp",
        fromPort: 443,
        toPort: 443,
        cidrs: ["0.0.0.0/0"],
    }],
});

const httpPort = new aws.lightsail.InstancePublicPorts(`${appName}-http`, {
    instanceName: instance.name,
    portInfos: [{
        protocol: "tcp",
        fromPort: 80,
        toPort: 80,
        cidrs: ["0.0.0.0/0"],
    }],
});

const sshPort = new aws.lightsail.InstancePublicPorts(`${appName}-ssh`, {
    instanceName: instance.name,
    portInfos: [{
        protocol: "tcp",
        fromPort: 22,
        toPort: 22,
        cidrs: ["0.0.0.0/0"],
    }],
});

// Outputs
export const instanceName = instance.name;
export const instancePublicIp = staticIp.ipAddress;
export const instanceArn = instance.arn;
export const sshCommand = pulumi.interpolate`ssh -i anchorpoint-key.pem ubuntu@${staticIp.ipAddress}`;
export const httpUrl = pulumi.interpolate`http://${staticIp.ipAddress}`;
export const httpsUrl = pulumi.interpolate`https://${staticIp.ipAddress}`;
