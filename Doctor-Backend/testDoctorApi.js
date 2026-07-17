const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { id: '6a5891f88fbe9b114a140dcc', role: 'DOCTOR' },
  'supersecretjwtkey', 
  { expiresIn: '30d' }
);
console.log('Generated token');

const run = async () => {
  try {
    const apptRes = await fetch('http://localhost:5000/api/appointments', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('GET /api/appointments', apptRes.status, await apptRes.text().then(t => t.slice(0, 50)));

    const apptDocRes = await fetch('http://localhost:5000/api/appointments/doctor', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('GET /api/appointments/doctor', apptDocRes.status, await apptDocRes.text().then(t => t.slice(0, 50)));

    const schedRes = await fetch('http://localhost:5000/api/doctors/schedule/me/2026-07-16', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('GET /api/doctors/schedule/me/2026-07-16', schedRes.status, await schedRes.text());

    const docRes = await fetch('http://localhost:5000/api/doctors', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('GET /api/doctors', docRes.status, await docRes.text().then(t => t.slice(0, 100)));
  } catch(e) {
    console.log('FAILED:', e);
  }
}
run();
