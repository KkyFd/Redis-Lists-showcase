const express = require('express');
const redis = require('redis');
const client = redis.createClient({
    url: 'redis://192.168.1.11:6379',
    password: "trabalho",
});
module.exports = client;

client.on('error', err => console.log('Redis Client Error', err));

client.connect().then(() => {console.log('Connected to Redis');

const app = express();

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.static('assets'));

app.listen(3000, () => {
  console.log('Site funcionando no port 3000');
});
    
app.route('/').get(async(req, res) => {
  let latest_posts = await client.lRange('Posts', 0, 9)
  res.render('main', {posts: latest_posts})
}).post(async (req, res) =>{
  let post = req.body.post
  await client.lPush('Posts', post)
  res.redirect('/')
})
}).catch(err => {console.error('Failed to connect to Redis', err);});

process.on('SIGINT', () => {
  client.disconnect();
  console.log('Disconnected from Redis');
  process.exit();
});

process.on('SIGTERM', () => {
  client.disconnect();
  console.log('Disconnected from Redis');
  process.exit();
});
