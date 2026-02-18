#!/bin/bash

# Upskillize LMS Setup Script
echo "🚀 Setting up Upskillize LMS..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js v16 or higher.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version) detected${NC}"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL is not installed. Please install PostgreSQL v12 or higher.${NC}"
    echo "Installation guide: https://www.postgresql.org/download/"
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Backend setup
echo "🔧 Setting up backend..."
cd backend || exit
npm install

if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Creating .env file...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please update the .env file with your configuration${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

cd ..

# Frontend setup
echo ""
echo "🎨 Setting up frontend..."
cd frontend || exit
npm install

if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Creating frontend .env file...${NC}"
    cat > .env << EOL
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
EOL
    echo -e "${YELLOW}⚠️  Please update the frontend .env file with your Razorpay key${NC}"
else
    echo -e "${GREEN}✅ Frontend .env file already exists${NC}"
fi

cd ..

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Create PostgreSQL database:"
echo "   ${YELLOW}createdb upskillize_lms${NC}"
echo ""
echo "2. Update backend/.env with your database credentials and API keys"
echo ""
echo "3. Update frontend/.env with your API URL and Razorpay key"
echo ""
echo "4. Start the backend server:"
echo "   ${YELLOW}cd backend && npm run dev${NC}"
echo ""
echo "5. In a new terminal, start the frontend:"
echo "   ${YELLOW}cd frontend && npm run dev${NC}"
echo ""
echo "6. Open your browser at: ${GREEN}http://localhost:5173${NC}"
echo ""
echo "📚 For more information, see README.md"
echo ""
