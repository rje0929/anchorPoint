# Deployment Scripts

## Automated Deployment to Lightsail

### Quick Start

```bash
# From project root
npm run deploy
```

That's it! The script will:
1. ✅ Package your code (excluding playwright, pulumi, node_modules)
2. ✅ Upload to Lightsail
3. ✅ Install dependencies
4. ✅ Build the frontend
5. ✅ Restart both backend and frontend services

### Prerequisites

- Pulumi infrastructure deployed (`cd pulumi && pulumi up`)
- SSH key exists at `pulumi/anchorpoint-key.pem`
- `.env` file configured on the server

### Manual Usage

```bash
# Deploy using auto-detected IP from Pulumi
cd scripts
./deploy-to-lightsail.sh

# Or specify IP manually
./deploy-to-lightsail.sh 54.162.28.37
```

### What Gets Deployed

The script excludes these from the deployment package:
- `node_modules/` (reinstalled on server)
- `playwright/` (test files)
- `pulumi/` (infrastructure code)
- `.git/` (version control)
- `dist/` (rebuilt on server)
- `.env` (must be configured manually on server)

### First-Time Server Setup

If this is your first deployment, SSH into the server and create `.env`:

```bash
ssh -i pulumi/anchorpoint-key.pem ubuntu@<instance-ip>
cd /opt/anchorpoint
nano .env
```

Add your environment variables:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=your_database_url
PORT=3010
VITE_APP_MAPBOX_ACCESS_TOKEN=your_mapbox_token
```

Save with `Ctrl+X`, `Y`, `Enter`.

### Deployment Workflow

1. **Make code changes locally**
2. **Test locally**: `npm run dev`
3. **Deploy**: `npm run deploy`
4. **Verify**: Visit `http://<instance-ip>`

### Monitoring

After deployment, check service status:

```bash
ssh -i pulumi/anchorpoint-key.pem ubuntu@<instance-ip>
pm2 status
pm2 logs
```

### Troubleshooting

**Deployment fails with "Permission denied"**:
```bash
ssh -i pulumi/anchorpoint-key.pem ubuntu@<instance-ip>
sudo chown -R ubuntu:ubuntu /opt/anchorpoint
```

**Build fails**:
```bash
ssh -i pulumi/anchorpoint-key.pem ubuntu@<instance-ip>
cd /opt/anchorpoint
rm -rf node_modules
npm install
npm run build
```

**Services not starting**:
```bash
ssh -i pulumi/anchorpoint-key.pem ubuntu@<instance-ip>
pm2 restart all
pm2 logs
```

### Setting Up SSL (Optional)

Once you have a domain:

```bash
ssh -i pulumi/anchorpoint-key.pem ubuntu@<instance-ip>
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Future Enhancements

- [ ] CI/CD with GitHub Actions
- [ ] Automated database migrations
- [ ] Blue-green deployments
- [ ] Health checks before traffic switch
- [ ] Rollback capability
