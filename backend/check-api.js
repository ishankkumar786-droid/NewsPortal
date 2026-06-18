const http = require('http');

http.get('http://localhost:5000/api/v1/articles?limit=5', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed.data.articles.map(a => ({
        title: a.title,
        featuredImage: a.featuredImage
      })), null, 2));
    } catch (e) {
      console.log('Error parsing JSON:', data.substring(0, 500));
    }
  });
}).on('error', (err) => {
  console.log('Error fetching:', err.message);
});
