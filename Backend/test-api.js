import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  name: 'Test Farmer',
  email: 'testfarmer@example.com',
  password: 'password123',
  phone: '9876543210',
  location: 'Test Village, Test State',
  role: 'farmer'
};

const testTask = {
  title: 'Water the crops',
  description: 'Water the wheat field in the morning',
  dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
  priority: 'High',
  category: 'watering'
};

const testField = {
  name: 'North Field',
  location: {
    address: 'North Block, Sector 1, Test Village',
    coordinates: {
      latitude: 28.6139,
      longitude: 77.2090
    }
  },
  size: {
    value: 2.5,
    unit: 'acres'
  },
  soilType: 'loamy',
  currentCrop: 'Wheat'
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

    // Test 6: Create Task
    console.log('\n6. Testing Create Task...');
    const taskResponse = await axios.post(`${BASE_URL}/tasks`, testTask, authHeaders);
    console.log('✅ Task Created:', taskResponse.data.data.task.title);
    const taskId = taskResponse.data.data.task._id;

    // Test 7: Get Tasks
    console.log('\n7. Testing Get Tasks...');
    const tasksResponse = await axios.get(`${BASE_URL}/tasks`, authHeaders);
    console.log('✅ Tasks Retrieved:', tasksResponse.data.data.tasks.length, 'tasks found');

    // Test 8: Get Task Stats
    console.log('\n8. Testing Task Statistics...');
    const statsResponse = await axios.get(`${BASE_URL}/tasks/stats`, authHeaders);
    console.log('✅ Task Stats:', JSON.stringify(statsResponse.data.data.stats, null, 2));

    // Test 9: Create Field
    console.log('\n9. Testing Create Field...');
    const fieldResponse = await axios.post(`${BASE_URL}/fields`, testField, authHeaders);
    console.log('✅ Field Created:', fieldResponse.data.data.field.name);

    // Test 10: Get Fields
    console.log('\n10. Testing Get Fields...');
    const fieldsResponse = await axios.get(`${BASE_URL}/fields`, authHeaders);
    console.log('✅ Fields Retrieved:', fieldsResponse.data.data.fields.length, 'fields found');

    // Test 11: Create Post
    console.log('\n11. Testing Create Post...');
    const postData = {
      content: 'My wheat crop is growing well this season! Any tips for better yield?',
      category: 'Question',
      tags: ['wheat', 'farming-tips'],
      crop: 'wheat'
    };
    const postResponse = await axios.post(`${BASE_URL}/posts`, postData, authHeaders);
    console.log('✅ Post Created:', postResponse.data.data.post.content.substring(0, 50) + '...');

    // Test 12: Get Posts (Public)
    console.log('\n12. Testing Get Posts (Public)...');
    const postsResponse = await axios.get(`${BASE_URL}/posts`);
    console.log('✅ Posts Retrieved:', postsResponse.data.data.posts.length, 'posts found');

    console.log('\n🎉 All API tests completed successfully!');

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