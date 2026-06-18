const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const imageBuffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
fs.writeFileSync('dummy.gif', imageBuffer);

async function test() {
  try {
    // Login to get token
    const loginRes = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'reporter@newsportal.com', password: 'Password123!'
    });
    const token = loginRes.data.data.accessToken;

    const artRes = await axios.get('http://localhost:5000/api/v1/articles?limit=1');
    const articleId = artRes.data.data.articles[0]._id;

    console.log('Uploading to article:', articleId);

    const form = new FormData();
    form.append('image', fs.createReadStream('dummy.gif'));

    const api = axios.create({
      baseURL: 'http://localhost:5000/api/v1',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    try {
      const uploadRes = await api.post(`/articles/${articleId}/featured-image`, form, {
        headers: {
          'Authorization': `Bearer ${token}`
          // NOT setting Content-Type to see if it works!
        }
      });
      console.log('Upload Response (NO HEADER):', uploadRes.status);
    } catch (err) {
      console.error('Upload Error (NO HEADER):', err.response?.data || err.message);
    }

    try {
      const uploadRes2 = await api.post(`/articles/${articleId}/featured-image`, form, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' // Setting Content-Type to see if it breaks!
        }
      });
      console.log('Upload Response (WITH HEADER):', uploadRes2.status);
    } catch (err) {
      console.error('Upload Error (WITH HEADER):', err.response?.data || err.message);
    }

  } catch (err) {
    console.error('Test failed:', err.response?.data || err.message);
  }
}
test();
