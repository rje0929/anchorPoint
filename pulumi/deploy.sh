#!/bin/bash
# Deployment helper script for Anchor Point

set -e

INSTANCE_IP=$(pulumi stack output instancePublicIp 2>/dev/null)
KEY_FILE="anchorpoint-key.pem"

if [ -z "$INSTANCE_IP" ]; then
    echo "Error: Could not get instance IP. Have you run 'pulumi up'?"
    exit 1
fi

if [ ! -f "$KEY_FILE" ]; then
    echo "Extracting SSH key..."
    pulumi stack output privateKey --show-secrets > $KEY_FILE
    chmod 600 $KEY_FILE
fi

echo "========================================="
echo "Anchor Point Deployment Helper"
echo "========================================="
echo "Instance IP: $INSTANCE_IP"
echo ""

PS3='Select an option: '
options=("SSH into instance" "Deploy code from local" "Deploy code from Git" "View PM2 logs" "Restart services" "Setup SSL certificate" "Quit")
select opt in "${options[@]}"
do
    case $opt in
        "SSH into instance")
            echo "Connecting to instance..."
            ssh -i $KEY_FILE ubuntu@$INSTANCE_IP
            break
            ;;
        "Deploy code from local")
            echo "Packaging local code..."
            cd ..
            tar --exclude='node_modules' --exclude='.git' --exclude='dist' --exclude='pulumi' -czf anchorpoint.tar.gz .
            echo "Uploading to server..."
            scp -i pulumi/$KEY_FILE anchorpoint.tar.gz ubuntu@$INSTANCE_IP:/opt/anchorpoint/
            echo "Extracting and deploying..."
            ssh -i pulumi/$KEY_FILE ubuntu@$INSTANCE_IP << 'EOF'
cd /opt/anchorpoint
tar -xzf anchorpoint.tar.gz
rm anchorpoint.tar.gz
./startup.sh
EOF
            echo "Deployment complete!"
            rm anchorpoint.tar.gz
            break
            ;;
        "Deploy code from Git")
            read -p "Enter Git repository URL: " GIT_URL
            read -p "Enter branch name (default: main): " BRANCH
            BRANCH=${BRANCH:-main}
            echo "Deploying from Git..."
            ssh -i $KEY_FILE ubuntu@$INSTANCE_IP << EOF
cd /opt/anchorpoint
git init
git remote add origin $GIT_URL || git remote set-url origin $GIT_URL
git fetch origin
git checkout -f $BRANCH
git reset --hard origin/$BRANCH
./startup.sh
EOF
            echo "Deployment complete!"
            break
            ;;
        "View PM2 logs")
            ssh -i $KEY_FILE ubuntu@$INSTANCE_IP "pm2 logs"
            break
            ;;
        "Restart services")
            echo "Restarting services..."
            ssh -i $KEY_FILE ubuntu@$INSTANCE_IP "pm2 restart all"
            echo "Services restarted!"
            break
            ;;
        "Setup SSL certificate")
            read -p "Enter your domain name: " DOMAIN
            echo "Setting up SSL for $DOMAIN..."
            ssh -i $KEY_FILE ubuntu@$INSTANCE_IP << EOF
sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
EOF
            echo "SSL setup complete!"
            break
            ;;
        "Quit")
            break
            ;;
        *) echo "Invalid option $REPLY";;
    esac
done
