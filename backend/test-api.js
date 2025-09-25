const axios = require('axios');

async function testAPI() {
  try {
    console.log('🧪 Testing API endpoints...');
    
    // Test 1: Login to get token
    console.log('\n1. Testing login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'student@demo.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');
    
    const headers = { Authorization: `Bearer ${token}` };
    
    // Test 2: Dashboard data
    console.log('\n2. Testing dashboard data...');
    const dashboardResponse = await axios.get('http://localhost:5000/api/users/dashboard/data', { headers });
    const activities = dashboardResponse.data.data.recentActivities;
    console.log(`✅ Dashboard data received: ${activities.length} activities`);
    
    // Test 3: Activity stats
    console.log('\n3. Testing activity stats...');
    const statsResponse = await axios.get('http://localhost:5000/api/activities/stats/summary', { headers });
    const stats = statsResponse.data.data.summary;
    console.log(`✅ Activity stats received: ${stats.totalActivities} total, ${stats.approvedActivities} approved`);
    
    // Test 4: Activities with empty filters (this was failing before)
    console.log('\n4. Testing activities with empty filters...');
    const activitiesResponse = await axios.get('http://localhost:5000/api/activities', { 
      headers,
      params: { category: '', status: '', page: 1, limit: 5 }
    });
    console.log(`✅ Activities with empty filters: ${activitiesResponse.data.data.length} activities returned`);
    
    // Test 5: Activities with valid filters
    console.log('\n5. Testing activities with valid filters...');
    const filteredResponse = await axios.get('http://localhost:5000/api/activities', { 
      headers,
      params: { category: 'internship', status: 'approved' }
    });
    console.log(`✅ Filtered activities: ${filteredResponse.data.data.length} activities returned`);
    
    console.log('\n🎉 All tests passed! The API is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data?.errors) {
      console.error('Validation errors:', error.response.data.errors);
    }
  }
}

testAPI();
