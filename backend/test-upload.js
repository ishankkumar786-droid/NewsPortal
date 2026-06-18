const fs = require('fs');
const http = require('http');
const jwt = require('jsonwebtoken');

require('dotenv').config();

require('dotenv').config();

const JWT_SECRET = process.env.JWT_ACCESS_SECRET;
const imageBuffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
fs.writeFileSync('dummy.gif', imageBuffer);

async function test() {
  try {
    // Login to get token
    const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'reporter@newsportal.com', password: 'Password123!' })
    });
    const loginData = await loginRes.json();
    if (!loginData.success) throw new Error('Login failed: ' + loginData.message);
    const token = loginData.data.accessToken;

    // Create article
    const createRes = await fetch('http://localhost:5000/api/v1/articles', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test Article with image ' + Date.now(),
        summary: 'This is a test summary for upload',
        content: '<p>This is test content that is definitely more than fifty characters long, so it should easily pass the validation check required by the schema.</p>',
        category: '6a2e57249009b13c1f85cdd7' // Assume valid category ID
      })
    });
    const createData = await createRes.json();
    if (!createData.success) {
      console.error('Create failed:', createData);
      return;
    }
    const articleId = createData.data.article._id;
    console.log('Created article:', articleId);

    const form = new FormData();
    const blob = new Blob([imageBuffer], { type: 'image/gif' });
    form.append('image', blob, 'dummy.gif');

    const uploadRes = await fetch(`http://localhost:5000/api/v1/articles/${articleId}/featured-image`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: form
    });
    
    console.log('Upload Status Code:', uploadRes.status);
    const result = await uploadRes.text();
    console.log('Upload Response:', result);
  } catch (err) {
    console.error(err);
  }
}
test();
