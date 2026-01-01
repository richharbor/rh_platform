#!/bin/bash
# Install Docker
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update
sudo apt-get install -y docker-ce docker-compose

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Install Nginx
sudo apt-get install -y nginx certbot python3-certbot-nginx

# Copy production Nginx config (this assumes we find a way to get the file there, 
# for now we'll write it inline in the script or use a better provisioning tool later)
cat <<EOF > /etc/nginx/sites-available/rfin
server {
    listen 80;
    server_name api.richharbor.com;
    location / {
        proxy_pass http://localhost:5003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
server {
    listen 80;
    server_name admin.richharbor.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/rfin /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo systemctl restart nginx

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu

echo "Infrastructure Ready! Next step: Run 'sudo certbot --nginx' to enable SSL."
