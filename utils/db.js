import { MongoClient } from 'mongodb';

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';
const DB_URL = `mongodb://${DB_HOST}:${DB_PORT}`;

class DBCLient {
  constructor() {
    MongoClient.connect(DB_URL, { useUnifiedTopology: true }, (err, client) => {
      if (!err) {
        this.db = client.db(DB_DATABASE);
        this.userCollection = this.db.collection('users');
        this.filesCollection = this.db.collection('files');
      } else {
        console.err(err);
        this.db = false;
      }
    });
  }

  isAlive() {
    return Boolean(this.db);
  }

  async nbUsers() {
    return this.userCollection.countDocuments();
  }

  async nbFiles() {
    return this.filesCollection.countDocuments();
  }
}

const dbClient = new DBCLient();
export default dbClient;
