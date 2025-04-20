import * as chai from 'chai';
import chaiHttp from 'chai-http';
const { expect } = chai;
import app from '../index.js'; // Adjust the path to your app file
chai.use(chaiHttp);

describe('Integration Tests for Backend Routes', () => {
  describe('GET /api/trips', () => {
    it('should return 200 and an array of trips', (done) => {
      request(app)
        .get('/trips')
        .set('Cookie', 'accesstoken=valid_token') // Replace with a valid token
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          done();
        });
    });
  });

  describe('POST /trips', () => {
    it('should create a new trip and return 201', (done) => {
      const tripData = {
        tripName: 'Test Trip',
        participantEmails: ['test1@example.com', 'test2@example.com'],
      };

      request(app)
        .post('/trips')
        .set('Cookie', 'accesstoken=valid_token') // Replace with a valid token
        .send(tripData)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('success', true);
          expect(res.body.trip).to.have.property('name', 'Test Trip');
          done();
        });
    });
  });

  describe('POST /transactions', () => {
    it('should create a transaction and return 201', (done) => {
      const transactionData = {
        tripId: 'valid_trip_id', // Replace with a valid trip ID
        amount: 100,
        description: 'Test Transaction',
        shares: { user1: 50, user2: 50 },
      };

      request(app)
        .post('/transactions')
        .set('Cookie', 'accesstoken=valid_token') // Replace with a valid token
        .send(transactionData)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('success', true);
          expect(res.body.transaction).to.have.property('amount', 100);
          done();
        });
    });
  });

  describe('GET /user/balances', () => {
    it('should return user balances', (done) => {
      request(app)
        .get('/user/balances')
        .set('Cookie', 'accesstoken=valid_token') // Replace with a valid token
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body.balances).to.have.property('youOwe');
          expect(res.body.balances).to.have.property('youAreOwed');
          done();
        });
    });
  });
});