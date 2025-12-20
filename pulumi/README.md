# Anchor Point - Pulumi Infrastructure

This directory contains Pulumi infrastructure-as-code for deploying Anchor Point to AWS Lightsail.

## Prerequisites

1. **AWS Account** with credentials configured
2. **Pulumi Account** (free tier available at https://app.pulumi.com)
3. **Node.js** 18+ installed
4. **Pulumi CLI** installed: `curl -fsSL https://get.pulumi.com | sh`

## Initial Setup

### 1. Install Dependencies

```bash
cd pulumi
npm install
```

### 2. Configure AWS Credentials

```bash
# Option 1: AWS CLI
aws configure

# Option 2: Environment variables
export AWS_ACCESS_KEY_ID=<your-access-key>
export AWS_SECRET_ACCESS_KEY=<your-secret-key>
export AWS_REGION=us-east-1
```

### 3. Login to Pulumi

```bash
pulumi login
```

### 4. Initialize Pulumi Stack

```bash
# Create a new stack (e.g., "dev" or "prod")
pulumi stack init dev

# Set AWS region (optional, defaults to us-east-1)
pulumi config set aws:region us-east-1
```

## Deployment

### Deploy Infrastructure

```bash
# Preview changes
pulumi preview

# Deploy
pulumi up
```

This will:
- ✅ Create a Lightsail instance (Ubuntu 22.04)
- ✅ Install Node.js, Nginx, PM2
- ✅ Configure firewall (ports 22, 80, 443)
- ✅ Create and attach a static IP
- ✅ Generate SSH key pair
- ✅ Set up reverse proxy with Nginx

### Get Instance Information

```bash
# View all outputs
pulumi stack output

# Get specific outputs
pulumi stack output instancePublicIp
pulumi stack output sshCommand
```

### Save SSH Private Key

```bash
# Save the private key to a file
pulumi stack output privateKey --show-secrets > anchorpoint-key.pem
chmod 600 anchorpoint-key.pem
```

## Post-Deployment Steps

### 1. SSH into the Instance

```bash
# Get the SSH command
pulumi stack output sshCommand

# Or manually
ssh -i anchorpoint-key.pem ubuntu@$(pulumi stack output instancePublicIp)
```

### 2. Upload Your Code

Option A: Clone from Git (recommended)
```bash
ssh -i anchorpoint-key.pem ubuntu@<instance-ip>
cd /opt/anchorpoint
git clone <your-repo-url> .
```

Option B: Upload via SCP
```bash
# From your local machine
cd /Users/robbie.edwards/Desktop/anchorPoint
tar --exclude='node_modules' --exclude='.git' -czf anchorpoint.tar.gz .
scp -i pulumi/anchorpoint-key.pem anchorpoint.tar.gz ubuntu@<instance-ip>:/opt/anchorpoint/
ssh -i pulumi/anchorpoint-key.pem ubuntu@<instance-ip>
cd /opt/anchorpoint
tar -xzf anchorpoint.tar.gz
rm anchorpoint.tar.gz
```

### 3. Configure Environment Variables

```bash
# SSH into the instance
ssh -i anchorpoint-key.pem ubuntu@<instance-ip>

# Create .env file
cd /opt/anchorpoint
nano .env
```

Add your environment variables:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=your_database_url
PORT=3010
VITE_APP_MAPBOX_ACCESS_TOKEN=your_mapbox_token
```

### 4. Run the Startup Script

```bash
cd /opt/anchorpoint
./startup.sh
```

This will:
- Install dependencies
- Generate Prisma client
- Build the frontend
- Start backend and frontend with PM2

### 5. Verify Deployment

```bash
# Check PM2 processes
pm2 status
pm2 logs

# Check Nginx
sudo systemctl status nginx
sudo nginx -t

# Test the application
curl http://localhost
```

### 6. Configure Domain (Optional)

If you have a domain, point your DNS A record to the instance IP:

```bash
# Get the IP
pulumi stack output instancePublicIp
```

Then set up SSL with Let's Encrypt:

```bash
# SSH into instance
ssh -i anchorpoint-key.pem ubuntu@<instance-ip>

# Install SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts
# Certbot will automatically configure Nginx for HTTPS
```

## Management Commands

### View Infrastructure State

```bash
# List all resources
pulumi stack

# View outputs
pulumi stack output

# View configuration
pulumi config
```

### Update Infrastructure

```bash
# Make changes to index.ts
# Preview changes
pulumi preview

# Apply changes
pulumi up
```

### Destroy Infrastructure

```bash
# WARNING: This will delete all resources
pulumi destroy
```

## Deployment Workflow

For ongoing deployments (code updates):

```bash
# SSH into instance
ssh -i anchorpoint-key.pem ubuntu@<instance-ip>

# Pull latest code
cd /opt/anchorpoint
git pull

# Install dependencies (if package.json changed)
npm install

# Rebuild frontend
npm run build

# Restart services
pm2 restart all

# Or run the full startup script
./startup.sh
```

## Monitoring

### Check Application Logs

```bash
# SSH into instance
ssh -i anchorpoint-key.pem ubuntu@<instance-ip>

# View PM2 logs
pm2 logs

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# View system resources
pm2 monit
```

## Troubleshooting

### Instance Not Starting
```bash
# Check instance status
pulumi stack output instanceArn
aws lightsail get-instance --instance-name anchorpoint-server

# View instance console output
aws lightsail get-instance-console-output --instance-name anchorpoint-server
```

### Can't SSH
```bash
# Verify key permissions
chmod 600 anchorpoint-key.pem

# Check firewall rules
pulumi stack output | grep ssh
```

### Application Not Running
```bash
# SSH into instance
ssh -i anchorpoint-key.pem ubuntu@<instance-ip>

# Check PM2 status
pm2 status
pm2 logs

# Restart services
pm2 restart all

# Check Nginx
sudo systemctl status nginx
sudo nginx -t
```

## Cost Estimation

- Lightsail Instance (medium_2_0): **$10/month**
- Static IP: **Free** (included)
- Data Transfer: **Free** (1TB included)
- Backups (optional): **$1/snapshot**

**Total: ~$10-15/month**

## Backup Strategy

### Create Snapshot

```bash
aws lightsail create-instance-snapshot \
  --instance-name anchorpoint-server \
  --instance-snapshot-name anchorpoint-backup-$(date +%Y%m%d)
```

### Automate Backups with Pulumi

Add to `index.ts`:
```typescript
const snapshot = new aws.lightsail.InstanceSnapshot("backup", {
    instanceName: instance.name,
    instanceSnapshotName: `${appName}-snapshot-${Date.now()}`,
});
```

## Security Best Practices

1. **Change SSH Key**: Rotate the SSH key regularly
2. **Update System**: Run `sudo apt-get update && sudo apt-get upgrade` regularly
3. **Firewall**: Only open necessary ports
4. **SSL**: Always use HTTPS in production
5. **Environment Variables**: Never commit `.env` files
6. **Database**: Keep Supabase credentials secure
7. **PM2**: Set up PM2 log rotation

## Additional Resources

- [Pulumi AWS Lightsail Docs](https://www.pulumi.com/registry/packages/aws/api-docs/lightsail/)
- [AWS Lightsail Documentation](https://docs.aws.amazon.com/lightsail/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
