import { Db, MongoClient, ObjectID } from 'mongodb';
import { expect } from 'jasmine-node';
import { MongoDBClient } from '../../../utils/mongodb/client';
import { User } from '../../../models/user';

describe('MongoDBClient', () => {
  let mongoClient: MongoDBClient;
  let mongoId: string;
  let driverDb: Db;

  /** Insert some testdata */
  beforeEach((done) => {
    MongoClient.connect('mongodb://localhost:27017/inversify-express-example', (error, db: Db) => {
      db.collection('user').drop((dropError, result) => {
        db.collection('user').insertOne({
          email: 'lorem@ipsum.com',
          name: 'Lorem'
        }, (e, insert) => {
          mongoId = insert.ops[0]._id;
          driverDb = db;
          done();
        });
      });
    });
  });

  beforeEach((done) => {
    mongoClient = new MongoDBClient();
    // let the mongodb connect
    setTimeout(() => {
      done();
    }, 1000);
  });

  it('should get back all user', (done) => {
    mongoClient.find('user', {}, (error, data) => {
      expect(error).toBe(null);

      expect(data).length.toBe(1);
      expect(data[0].email).toBe('lorem@ipsum.com');
      expect(data[0].name).toBe('Lorem');

      done();
    });
  });

  it('should give back the right user', (done) => {
    mongoClient.findOneById('user', mongoId, (error, data) => {
      expect(error).toBe(null);

      expect(data.email).toBe('lorem@ipsum.com');
      expect(data.name).toBe('Lorem');

      done();
    });
  });

  it('should add a new user', (done) => {
    mongoClient.insert('user', new User('dorem@sit.com', 'Dorem'), (error, data) => {
      expect(error).toBe(null);

      expect(data.email).toBe('dorem@sit.com');
      expect(data.name).toBe('Dorem');

      driverDb.collection('user').find().toArray((checkError, checkData) => {
        expect(checkData).length.toBe(2);

        driverDb.collection('user').deleteOne({ _id: new ObjectID(data._id) }, (cleanError, cleanData) => {
          done();
        });
      });
    });
  });

  it('should update a existing user', (done) => {
    mongoClient.update('user', mongoId, new User('test@ipsum.com', 'Test', mongoId), (error, data) => {
      expect(error).toBe(null);

      expect(data.email).toBe('test@ipsum.com');
      expect(data.name).toBe('Test');

      driverDb.collection('user').findOne({
        _id: mongoId
      }, (checkError, checkData) => {
        expect(checkData.email).toEqual('test@ipsum.com');
        expect(checkData.name).toEqual('Test');

        done();
      });
    });
  });

  it('should delete a user', (done) => {
    mongoClient.remove('user', mongoId, (error, data) => {
      driverDb.collection('user').find().toArray((checkError, checkData) => {
        expect(checkData).length.toBe(0);
        done();
      });
    });
  });
});
