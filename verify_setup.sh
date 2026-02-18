#!/bin/bash

echo "🔍 Verifying Upskillize LMS Setup..."
echo ""

# Check backend files
echo "Backend Files:"
files=(
  "backend/package.json"
  "backend/server.js"
  "backend/config/database.js"
  "backend/routes/auth.js"
  "backend/routes/courses.js"
  "backend/models/User.js"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ Missing: $file"
  fi
done

echo ""
echo "Frontend Files:"
ffiles=(
  "frontend/package.json"
  "frontend/src/App.jsx"
  "frontend/src/main.jsx"
  "frontend/src/pages/Login.jsx"
)

for file in "${ffiles[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ Missing: $file"
  fi
done

echo ""
echo "Documentation:"
docs=(
  "README.md"
  "INSTALLATION.md"
  "PROJECT_OVERVIEW.md"
  "DEPLOYMENT.md"
  "database/schema.sql"
)

for doc in "${docs[@]}"; do
  if [ -f "$doc" ]; then
    echo "✅ $doc"
  else
    echo "❌ Missing: $doc"
  fi
done

echo ""
echo "✨ Setup verification complete!"
echo ""
echo "Next steps:"
echo "1. cd backend && npm install"
echo "2. Configure .env file"
echo "3. Create MySQL database"
echo "4. npm run dev"
echo ""
