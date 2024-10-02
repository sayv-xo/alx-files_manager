import sha1 from 'sha1';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).send('Missing email');
    }
    if (!password) {
      return res.status(400).send('Missing password');
    }
    const emailExists = await dbClient.userCollection.findOne({ email });

    if (emailExists) {
      return res.status(400).send('Already exist');
    }

    const hashedPassword = sha1(password);
    const userId = new ObjectId();

    const newUser = {
      _id: userId,
      email,
      password: hashedPassword,
    };

    await dbClient.userCollection.insertOne(newUser);

    return res.status(201).send({ id: userId, email });
  }

  static async getMe(req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    try {
      const users = dbClient.db.collection('users');
      const idObject = new ObjectId(userId);
      const user = await users.findOne({ _id: idObject });

      if (user) {
        return res.status(200).send({ id: userId, email: user.email });
      }
      return res.status(401).send({ error: 'Unauthorized' });
    } catch (err) {
      console.error(err);
      return res.status(500).send({ error: 'Internal Server Error' });
    }
  }
}

module.exports = UsersController;
