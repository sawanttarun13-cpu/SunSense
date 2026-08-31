import axios from 'axios';
import * as jwt from 'jsonwebtoken';

async function test() {
  const token = jwt.sign({ userId: '3c82e666-6b21-4d1a-82fa-27352fbb6b8b' }, 'sunsense_jwt_secret_dev_2026_change_in_production', { expiresIn: '1d' });
  const res = await axios.get('http://localhost:5000/api/v1/alerts?status=all', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log(JSON.stringify(res.data, null, 2));
}

test().catch(console.error);
