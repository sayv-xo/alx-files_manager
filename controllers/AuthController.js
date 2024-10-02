import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  // eslint-disable-next-line consistent-return
  static async getConnect(req, res) {
    const header = req.header('Authorization');
    if (!header) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    let authData = header.split(' ')[1];
    const buffer = Buffer.from(authData, 'base64');
    authData = buffer.toString('ascii');
    const userData = authData.split(':');

    if (userData.length !== 2) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const hashedPassword = sha1(userData[1]);
    const users = await dbClient.db.collection('users');

    users.findOne({ email: userData[0], password: hashedPassword }, async (err, user) => {
      if (user) {
        const token = uuidv4();
        const key = `auth_${token}`;
        await redisClient.set(key, user._id.toString(), 3600 * 24);
        return res.status(200).send({ token });
      }
      return res.status(401).send({ error: 'Unauthorized' });
    });
  }

  static async getDisconnect(req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    const id = await redisClient.get(key);
    if (id) {
      await redisClient.del(key);
      return res.status(204).send({});
    }
    return res.status(401).send({ error: 'Unauthorized' });
  }
}

module.exports = AuthController;
