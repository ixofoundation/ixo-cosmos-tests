//Require the dev-dependencies
let sov = require('sovrin-did');
let chai = require('chai');
let chaiHttp = require('chai-http');
let mlog = require('mocha-logger');
let utils = require('../utils/utils');

let should = chai.should();

let config = require('../config/test.json')

chai.use(chaiHttp);

//Our parent block
describe('Dids', () => {
  let did1 = sov.gen();
  let did2 = sov.gen();
  let did1Tx = utils.createDidTx(did1);
  let did2Tx = utils.createDidTx(did2);

  before((done) => {
    let count =0
    chai.request(config.BLOCKCHAIN_URL)
      .get(did1Tx)
      .end((err, res) => {
        ++count;
        if( count == 2) setTimeout( done, 5000);
      });
    chai.request(config.BLOCKCHAIN_URL)
      .get(did2Tx)
      .end((err, res) => {
        ++count;
        if( count == 2) setTimeout( done, 5000);
      });
    });


  describe('Add Did', () => {
    let did = sov.gen();
    let payloadValue = {
      didDoc: {
        "did": did.did,
        "pubKey": did.verifyKey,
        "credentials": []
      }
    };

    it('it should Add successfully', (done) => {

      chai.request(config.BLOCKCHAIN_URL)
          .get(utils.makeURL('did/AddDid', did, payloadValue))
          .end((err, res) => {
                res.should.have.status(200);
                mlog.log(JSON.stringify(res.body));
                res.body.result.code.should.be.eql(0);
            done();
          });
    });

    it('it should fail invalid signature', (done) => {

      chai.request(config.BLOCKCHAIN_URL)
          .get(utils.makeURL('did/AddDid', did, payloadValue, false))
          .end((err, res) => {
                res.should.have.status(200);
                mlog.log(JSON.stringify(res.body));
                res.body.result.code.should.not.be.eql(0);
            done();
          });
    });
  });

  describe('Add Did Credential', () => {

    it('it should Add successfully', (done) => {
      payloadValue = {
        credential: {
          type:[
            "Credential",
            "ProofOfKYC"
          ],
          issuer:did1.did,
          issued:utils.newDateAsJSON(),
          claim: {
            id: did2.did,
            KYCValidated:true
          }
        }
      }
      chai.request(config.BLOCKCHAIN_URL)
        .get(utils.makeURL('did/AddCredential', did1, payloadValue))
        .end((err, res) => {
              res.should.have.status(200);
              mlog.log(JSON.stringify(res.body));
              res.body.result.code.should.be.eql(0);
        done();
      });
    });
  });

  
});
