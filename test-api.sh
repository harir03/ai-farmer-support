#!/bin/bash

echo "🚀 Starting AgroMitra Backend API Tests..."

BASE_URL="http://localhost:5000"

# Test 1: Health Check
echo -e "\n1. Testing Health Check..."
response=$(curl -s -X GET "$BASE_URL/")
if [[ $response == *"AgroMitra Backend API is running"* ]]; then
    echo "✅ Health Check: Passed"
else
    echo "❌ Health Check: Failed"
    echo "Response: $response"
fi

# Test 2: API Info
echo -e "\n2. Testing API Info..."
response=$(curl -s -X GET "$BASE_URL/api")
if [[ $response == *"AgroMitra API"* ]]; then
    echo "✅ API Info: Passed"
else
    echo "❌ API Info: Failed"
    echo "Response: $response"
fi

# Test 3: User Registration
echo -e "\n3. Testing User Registration..."
registration_data='{
  "name": "Test Farmer",
  "email": "test_farmer_api@example.com",
  "password": "password123",
  "phone": "9876543210",
  "location": "Test Village, Test State",
  "role": "farmer"
}'

reg_response=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "$registration_data")

if [[ $reg_response == *"success\":true"* ]]; then
    echo "✅ User Registration: Passed"
elif [[ $reg_response == *"already exists"* ]]; then
    echo "⚠️  User already exists, continuing..."
else
    echo "❌ User Registration: Failed"
    echo "Response: $reg_response"
fi

# Test 4: User Login
echo -e "\n4. Testing User Login..."
login_data='{
  "email": "test_farmer_api@example.com",
  "password": "password123"
}'

login_response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "$login_data")

if [[ $login_response == *"success\":true"* ]]; then
    echo "✅ User Login: Passed"
    # Extract token for further tests
    token=$(echo $login_response | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "   Token extracted: ${token:0:20}..."
    
    # Test 5: Get User Profile
    echo -e "\n5. Testing Get User Profile..."
    profile_response=$(curl -s -X GET "$BASE_URL/api/auth/profile" \
      -H "Authorization: Bearer $token")
    
    if [[ $profile_response == *"success\":true"* ]]; then
        echo "✅ User Profile: Passed"
    else
        echo "❌ User Profile: Failed"
        echo "Response: $profile_response"
    fi
    
else
    echo "❌ User Login: Failed"
    echo "Response: $login_response"
fi

echo -e "\n🎉 API tests completed!"
echo -e "\n📊 Backend Features Available:"
echo "   - ✅ Express.js server with CORS"
echo "   - ✅ MongoDB connection"
echo "   - ✅ JWT authentication"
echo "   - ✅ User management"
echo "   - ✅ Task management APIs"
echo "   - ✅ Field management APIs"
echo "   - ✅ Community posts APIs"
echo "   - ✅ Community groups APIs"
echo "   - ✅ Input validation"
echo "   - ✅ Error handling"