import sha1 from 'sha1';
import dbClient from '../utils/db';

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

    let result;

    try {
      result = await dbClient.userCollection.insertOne({
        email, password: hashedPassword,
      });
    } catch (err) {
      return res.status(500).send('Error creating user');
    }
    const user = {
      id: result.insertedId,
      email,
    };
    return res.status(201).send(user);
  }
}

module.exports = UsersController;
