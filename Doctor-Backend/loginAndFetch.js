const mongoose = require('mongoose');

const run = async () => {
  try {
    console.log('Logging in...');
    // Login to get token
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'patient@example.com', password: 'password123' })
    });
    
    if (!loginRes.ok) {
      console.error('Login failed:', loginRes.status, await loginRes.text());
      return;
    }
    
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Got token, fetching doctors...');

    const res = await fetch('http://localhost:5000/api/doctors', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error('API Error:', res.status, errorText);
    } else {
      const data = await res.json();
      console.log('Success! Doctors count:', data.length);
    }
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    process.exit(0);
  }
}

run();
