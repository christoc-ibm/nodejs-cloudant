import chai from 'chai';
import request from 'supertest';
import quibble from 'quibble';

const expect = chai.expect;

class cloudantMock {
  static newInstance(options) {
    return new this;
  }

  setServiceUrl(url) {
    return null;
  }

  putDatabase(options) {
    return Promise.resolve({});
  }

  postDocument(params) {
    return Promise.resolve({
      id: 'id',
      name: 'name',
      timestamp: 'timestamp',
    });
  }
}

let server;
before(async() => {
  await quibble.esm('@ibm-cloud/cloudant', {CloudantV1: cloudantMock});
  server = await (await import('../../server/server.js')).default;
});

after(() => {
  quibble.reset();
});

// example functional tests of routes
describe('GET /', () => {
  it('responds with homepage', () => {
    return request(server)
      .get('/')
      .expect('Content-Type', 'text/html; charset=UTF-8')
      .expect(200)
      .then(response => {
        expect(response.text).to.include(
          'IBM Cloud - Node.js + Cloudant',
        );
      });
  });
});

describe('GET /health', () => {
  it('responds with json', () => {
    return request(server)
      .get('/health/')
      .set('Accept', 'application/json')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200, {
        status: 'UP',
      });
  });
});

describe('POST /fake/route', () => {
  it('responds with not found page', () => {
    return request(server)
      .post('/fake/route')
      .expect('Content-Type', 'text/html; charset=UTF-8')
      .expect(200)
      .then(response => {
        expect(response.text).to.include(
          'Whoops! Looks like you got lost or couldn\'t find your page.',
        );
      });
  });
});

describe('POST /api/names', () => {
  it('responds with created', () => {
    return request(server)
      .post('/api/names')
      .send({
        name: 'example',
        timestamp: '2020-11-04T17:53:09.589Z',
      })
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(201);
  });

  it('responds with bad request', () => {
    return request(server)
      .post('/api/names')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(400);
  });
});
