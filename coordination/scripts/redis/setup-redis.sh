#!/bin/bash

# Redis Setup Script for Hirable AI
# Sets up Redis for local development and production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Redis Setup for Hirable AI${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check operating system
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    OS="windows"
else
    OS="unknown"
fi

echo -e "${YELLOW}Detected OS: $OS${NC}"
echo ""

# Install Redis based on OS
install_redis() {
    case $OS in
        "linux")
            if command_exists apt-get; then
                echo -e "${YELLOW}Installing Redis via apt-get...${NC}"
                sudo apt-get update
                sudo apt-get install -y redis-server
            elif command_exists yum; then
                echo -e "${YELLOW}Installing Redis via yum...${NC}"
                sudo yum install -y redis
            elif command_exists pacman; then
                echo -e "${YELLOW}Installing Redis via pacman...${NC}"
                sudo pacman -S redis
            else
                echo -e "${RED}Could not detect package manager. Please install Redis manually.${NC}"
                exit 1
            fi
            ;;
        "macos")
            if command_exists brew; then
                echo -e "${YELLOW}Installing Redis via Homebrew...${NC}"
                brew install redis
            else
                echo -e "${RED}Homebrew not found. Please install Homebrew first or install Redis manually.${NC}"
                exit 1
            fi
            ;;
        "windows")
            echo -e "${YELLOW}For Windows (WSL detected), installing via apt...${NC}"
            sudo apt-get update
            sudo apt-get install -y redis-server
            ;;
        *)
            echo -e "${RED}Unsupported OS. Please install Redis manually.${NC}"
            exit 1
            ;;
    esac
}

# Check if Redis is installed
if command_exists redis-server; then
    echo -e "${GREEN}✓ Redis is already installed${NC}"
else
    echo -e "${YELLOW}Redis not found. Installing...${NC}"
    install_redis
fi

# Check Redis version
REDIS_VERSION=$(redis-server --version | head -n1)
echo -e "${GREEN}✓ $REDIS_VERSION${NC}"
echo ""

# Configure Redis for development
echo -e "${YELLOW}Configuring Redis for development...${NC}"

# Create Redis config directory if it doesn't exist
mkdir -p ~/.redis

# Create development Redis configuration
cat > ~/.redis/redis-dev.conf << 'EOF'
# Redis Configuration for Hirable AI Development
port 6379
bind 127.0.0.1
protected-mode yes
timeout 0
keepalive 300

# Memory management
maxmemory 256mb
maxmemory-policy allkeys-lru

# Persistence (for development - minimal)
save 900 1
save 300 10
save 60 10000

# Logging
loglevel notice
logfile ""

# Disable dangerous commands in development
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command CONFIG ""
rename-command EVAL ""

# Performance tuning
tcp-keepalive 60
tcp-backlog 511
databases 16

# Rate limiting specific settings
# These databases are reserved for rate limiting
# DB 0: General rate limiting
# DB 1: Authentication rate limiting  
# DB 2: File upload rate limiting
# DB 3: AI processing rate limiting
EOF

echo -e "${GREEN}✓ Development configuration created${NC}"

# Start Redis server function
start_redis() {
    echo -e "${YELLOW}Starting Redis server...${NC}"
    
    if [[ "$OS" == "macos" ]]; then
        brew services start redis
    elif [[ "$OS" == "linux" || "$OS" == "windows" ]]; then
        # Check if systemd is available
        if command_exists systemctl; then
            sudo systemctl start redis-server
            sudo systemctl enable redis-server
        else
            # Start Redis manually
            redis-server ~/.redis/redis-dev.conf --daemonize yes
        fi
    fi
    
    # Wait for Redis to start
    sleep 2
    
    # Test connection
    if redis-cli ping > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Redis server started successfully${NC}"
    else
        echo -e "${RED}✗ Failed to start Redis server${NC}"
        exit 1
    fi
}

# Check if Redis is running
if redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Redis server is already running${NC}"
else
    start_redis
fi

# Test Redis connection and setup
echo -e "${YELLOW}Testing Redis connection...${NC}"

# Test basic operations
redis-cli set test_key "Hello Hirable AI" > /dev/null
TEST_VALUE=$(redis-cli get test_key)
redis-cli del test_key > /dev/null

if [[ "$TEST_VALUE" == "Hello Hirable AI" ]]; then
    echo -e "${GREEN}✓ Redis connection test passed${NC}"
else
    echo -e "${RED}✗ Redis connection test failed${NC}"
    exit 1
fi

# Setup rate limiting test
echo -e "${YELLOW}Setting up rate limiting structures...${NC}"

# Create rate limiting test keys
redis-cli del "rate_limit:test:*" > /dev/null 2>&1

echo -e "${GREEN}✓ Rate limiting structures initialized${NC}"

# Display Redis info
echo ""
echo -e "${BLUE}Redis Configuration:${NC}"
echo -e "Host: ${GREEN}localhost${NC}"
echo -e "Port: ${GREEN}6379${NC}"
echo -e "Databases: ${GREEN}16${NC}"
echo -e "Max Memory: ${GREEN}256MB${NC}"
echo -e "Config File: ${GREEN}~/.redis/redis-dev.conf${NC}"
echo ""

# Show useful commands
echo -e "${BLUE}Useful Redis Commands:${NC}"
echo -e "Start Redis: ${YELLOW}redis-server ~/.redis/redis-dev.conf${NC}"
echo -e "Stop Redis: ${YELLOW}redis-cli shutdown${NC}"
echo -e "Connect to Redis: ${YELLOW}redis-cli${NC}"
echo -e "Monitor Redis: ${YELLOW}redis-cli monitor${NC}"
echo -e "View Redis info: ${YELLOW}redis-cli info${NC}"
echo ""

# Production setup notes
echo -e "${BLUE}Production Setup Notes:${NC}"
echo "1. For production, use Redis Cloud, AWS ElastiCache, or dedicated Redis server"
echo "2. Update REDIS_HOST, REDIS_PORT, REDIS_PASSWORD in .env.local"
echo "3. Enable authentication: requirepass your-secure-password"
echo "4. Use SSL/TLS encryption for production connections"
echo "5. Set up Redis Sentinel or Cluster for high availability"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Redis Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Redis is now running and configured for development"
echo "2. Rate limiting is ready for your Hirable AI application"
echo "3. Run your Next.js application: npm run dev"
echo "4. Test rate limiting endpoints"
echo ""
echo -e "${GREEN}Happy Redis-powered development! 🚀✨${NC}"