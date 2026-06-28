#!/bin/bash

# --- AUTOMATIC VPS INITIALIZATION SCRIPT FOR ONLINE CODE JUDGE ---
# Run this script on your VPS as root/sudo user.
# Command to run: chmod +x setup_vps.sh && ./setup_vps.sh

set -e

# Output Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Starting VPS Setup for Online Code Judge ===${NC}"

# 1. Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run this script as root or with sudo.${NC}"
  exit 1
fi

# 2. Setup 4GB Swap File (Crucial for 4GB RAM VPS to prevent Out-Of-Memory)
echo -e "${YELLOW}[1/4] Configuring 4GB Swap Space...${NC}"
if [ $(free -m | awk '/^Swap:/{print $2}') -eq 0 ]; then
    echo "Creating swapfile..."
    fallocate -l 4G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=4096
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo -e "${GREEN}Swap space (4GB) configured successfully!${NC}"
else
    echo -e "${GREEN}Swap space is already configured.${NC}"
fi

# 3. Update & Upgrade packages
echo -e "${YELLOW}[2/4] Updating system packages...${NC}"
apt-get update && apt-get upgrade -y

# 4. Install Docker & Docker Compose
echo -e "${YELLOW}[3/4] Installing Docker and Docker Compose...${NC}"
if ! command -v docker &> /dev/null; then
    apt-get install -y apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io
    systemctl start docker
    systemctl enable docker
    echo -e "${GREEN}Docker installed successfully!${NC}"
else
    echo -e "${GREEN}Docker is already installed.${NC}"
fi

if ! docker compose version &> /dev/null; then
    apt-get install -y docker-compose-plugin
    echo -e "${GREEN}Docker Compose installed successfully!${NC}"
else
    echo -e "${GREEN}Docker Compose is already installed.${NC}"
fi

# 5. Install Nginx & Git
echo -e "${YELLOW}[4/4] Installing Nginx, Git, and Certbot...${NC}"
apt-get install -y nginx git certbot python3-certbot-nginx

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx

echo -e "${GREEN}=== VPS Initialization Completed! ===${NC}"
echo -e "You can now clone the repository, configure your .env.docker, and run:"
echo -e "${YELLOW}docker compose up -d --build${NC}"
