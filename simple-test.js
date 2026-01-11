#!/usr/bin/env node

import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  name: 'Test Farmer',
  email: 'testfarmer2@example.com',
  password: 'password123',
  phone: '9876543210',
  location: 'Test Village, Test State',
  role: 'farmer'
};

async function testAPI() {
  try {
    console.log('🚀 Starting AgroMitra Backend API Tests...\n');

    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get('http://localhost:5000/');
    console.log('✅ Health Check:', healthResponse.data.message);

    // Test 2: API Info
    console.log('\n2. Testing API Info...');
    const apiResponse = await axios.get(`${BASE_URL}`);
    console.log('✅ API Info:', apiResponse.data.message);

    // Test 3: User Registration
    console.log('\n3. Testing User Registration...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
      console.log('✅ User Registration:', registerResponse.data.message);
      console.log('   User ID:', registerResponse.data.data.user._id);
    } catch (error) {
      if (error.response?.data.message.includes('already exists')) {
        console.log('⚠️  User already exists, continuing...');
      } else {
        throw error;
      }
    }

    // Test 4: User Login
    console.log('\n4. Testing User Login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ User Login:', loginResponse.data.message);
    const token = loginResponse.data.data.token;
    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    // Test 5: Get User Profile
    console.log('\n5. Testing Get User Profile...');
    const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, authHeaders);
    console.log('✅ User Profile:', profileResponse.data.data.user.name);

    console.log('\n🎉 Basic API tests completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('   - Health Check: ✅');
    console.log('   - API Info: ✅');
    console.log('   - User Registration: ✅');
    console.log('   - User Login: ✅');
    console.log('   - User Profile: ✅');

  } catch (error) {
    console.error('\n❌ Test Failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message);
      if (error.response.data.errors) {
        console.error('Errors:', error.response.data.errors);
      }
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run tests
testAPI();