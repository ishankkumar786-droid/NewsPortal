const http = require('http');

http.get('http://localhost:5000/api/v1/articles?limit=1', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Latest Article ID:', parsed.data.articles[0]._id);
    } catch (e) {
      console.log('Error parsing JSON');
    }
  });
});
