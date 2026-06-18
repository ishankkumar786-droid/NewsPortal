const http = require('http');

http.get('http://localhost:5000/api/v1/articles/slug/sbbewrargaev5', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed.data.article.featuredImage, null, 2));
    } catch (e) {
      console.log('Error parsing JSON:', data.substring(0, 500));
    }
  });
}).on('error', (err) => {
  console.log('Error fetching:', err.message);
});
