//Require the dev-dependencies
let sov = require('sovrin-did');
let chai = require('chai');
let chaiHttp = require('chai-http');
let mlog = require('mocha-logger');
let utils = require('../utils/utils');

let should = chai.should();

let config = require('../config/test.json')

chai.use(chaiHttp);

var createProjectDidTx = function(did){
  let payloadValue = {
    data: {
      nodeDid:"12345",
      createdOn:utils.newDateAsJSON(),
      createdBy:did.did,
      requiredClaims:"1298",
      evaluatorPayPerClaim:"10234030",
      serviceEndpoint:"https://togo.pds.ixo.network",
    },
    txHash:"1000000",
    senderDid:did.did,
    projectDid:did.did,
    pubKey:did.verifyKey
  };
  return utils.makeURL('project/CreateProject', did, payloadValue);
}

//Our parent block
describe('Projects', () => {
  let projectDid = sov.gen();
  let projectTx = createProjectDidTx(projectDid);
  let did1 = sov.gen();
  let did1Tx = utils.createDidTx(did1);
  let did2 = sov.gen();
  let did2Tx = utils.createDidTx(did2);

  before((done) => {
    let count =0
    chai.request(config.BLOCKCHAIN_URL)
      .get(did1Tx)
      .end((err, res) => {
        ++count;
        if( count == 3) setTimeout( done, 5000);
      });
    chai.request(config.BLOCKCHAIN_URL)
      .get(did2Tx)
      .end((err, res) => {
        ++count;
        if( count == 3) setTimeout( done, 5000);
      });
    chai.request(config.BLOCKCHAIN_URL)
      .get(projectTx)
      .end((err, res) => {
        ++count;
        if( count == 3) setTimeout( done, 5000);
      });
    });

  describe('Create Project', () => {
    let did = sov.gen();
    let payloadValue = {
      data: {
        title:"Togo Water Project",
        shortDescription:"To provide clean water and sanitation to the rural areas of Togo",
        longDescription:"This is a long description",
        impactAction:"successful water systems built",
        createdOn:utils.newDateAsJSON(),
        createdBy:did.did,
        country:"TG",
        sdgs:["3","6","15"],
        nodeDid:"12345",
        requiredClaims:"1298",
        claimTemplate:"togo_default",
        evaluatorPayPerClaim:"10234030",
        socialMedia:{
          facebookLink:"",
          instagramLink:"",
          twitterLink:"",
          webLink:""
        },
        serviceEndpoint:"https://togo.pds.ixo.network",
        imageLink:"https://togo.pds.ixo.network/image/1"
      },
      txHash:"1000000",
      senderDid:did.did,
      projectDid:did.did,
      pubKey:did.verifyKey
    };
  
    it('it should Create successfully', (done) => {

      chai.request(config.BLOCKCHAIN_URL)
          .get(utils.makeURL('project/CreateProject', did, payloadValue))
          .end((err, res) => {
                res.should.have.status(200);
                mlog.log(JSON.stringify(res.body));
                res.body.result.code.should.be.eql(0);
            done();
          });
    });

    it('it should fail invalid signature', (done) => {

      chai.request(config.BLOCKCHAIN_URL)
          .get(utils.makeURL('project/CreateProject', did, payloadValue, false))
          .end((err, res) => {
                res.should.have.status(200);
                mlog.log(JSON.stringify(res.body));
                res.body.result.code.should.not.be.eql(0);
            done();
          });
      });
    });

    describe('Update Project Status', () => {
      const Project_STATUS = {
        NullStatus: "",
        CreatedProject: "CREATED",
        PendingStatus: "PENDING",
        FundedStatus: "FUNDED",
        StartedStatus: "STARTED",
        StoppedStatus: "STOPPED",
        PaidoutStatus: "PAIDOUT",
      };

      it('Update the status', (done) => {
        payloadValue = {
          data:{
            status:Project_STATUS.CreatedProject,
            ethFundingTxnID:""
          },
          txHash:"1000001",
          senderDid:did1.did,
          projectDid:projectDid.did
        };
        chai.request(config.BLOCKCHAIN_URL)
          .get(utils.makeURL('project/UpdateProjectStatus', projectDid, payloadValue))
          .end((err, res) => {
              res.should.have.status(200);
              mlog.log(JSON.stringify(res.body));
              res.body.result.code.should.be.eql(0);
          done();
        });
      });
    });

  describe('Create Agent', () => {

    it('it should Add Service Agent successfully', (done) => {
      payloadValue = {
        data:{
          did:did1.did,
          role:"SA"
        },
        txHash:"1000001",
        senderDid:did1.did,
        projectDid:projectDid.did
      };

      chai.request(config.BLOCKCHAIN_URL)
        .get(utils.makeURL('project/CreateAgent', projectDid, payloadValue))
        .end((err, res) => {
              res.should.have.status(200);
              mlog.log(JSON.stringify(res.body));
              res.body.result.code.should.be.eql(0);
        done();
      });
    });

    it('it should Add Evaluation Agent successfully', (done) => {
      payloadValue = {
        data:{
          did:did2.did,
          role:"EA"
        },
        txHash:"1000001",
        senderDid:did2.did,
        projectDid:projectDid.did
      };

      chai.request(config.BLOCKCHAIN_URL)
        .get(utils.makeURL('project/CreateAgent', projectDid, payloadValue))
        .end((err, res) => {
              res.should.have.status(200);
              mlog.log(JSON.stringify(res.body));
              res.body.result.code.should.be.eql(0);
        done();
      });
    });

    it('it should Investment Agent successfully', (done) => {
      payloadValue = {
        data:{
          did:did1.did,
          role:"IA"
        },
        txHash:"1000001",
        senderDid:did1.did,
        projectDid:projectDid.did
      };

      chai.request(config.BLOCKCHAIN_URL)
        .get(utils.makeURL('project/CreateAgent', projectDid, payloadValue))
        .end((err, res) => {
              res.should.have.status(200);
              mlog.log(JSON.stringify(res.body));
              res.body.result.code.should.be.eql(0);
        done();
      });
    });
  });

  describe('Update Agent Status', () => {
    const AGENT_STATUS = {
      pending:"0",
      approved:"1",
      revoked:"2",
    };

    it('it should be successfully - set to pending', (done) => {
      payloadValue = {
        data:{
          did:did1.did,
          status:AGENT_STATUS.pending
        },
        txHash:"1000001",
        senderDid:did1.did,
        projectDid:projectDid.did
      };

      chai.request(config.BLOCKCHAIN_URL)
        .get(utils.makeURL('project/UpdateAgent', projectDid, payloadValue))
        .end((err, res) => {
              res.should.have.status(200);
              mlog.log(JSON.stringify(res.body));
              res.body.result.code.should.be.eql(0);
        done();
      });
    });

    it('it should be successfully - set to approved', (done) => {
      payloadValue = {
        data:{
          did:did1.did,
          status:AGENT_STATUS.approved
        },
        txHash:"1000001",
        senderDid:did1.did,
        projectDid:projectDid.did
      };

      chai.request(config.BLOCKCHAIN_URL)
        .get(utils.makeURL('project/UpdateAgent', projectDid, payloadValue))
        .end((err, res) => {
              res.should.have.status(200);
              mlog.log(JSON.stringify(res.body));
              res.body.result.code.should.be.eql(0);
        done();
      });
    });

    it('it should be successfully - set to revoked', (done) => {
      payloadValue = {
        data:{
          did:did1.did,
          status:AGENT_STATUS.revoked
        },
        txHash:"1000001",
        senderDid:did1.did,
        projectDid:projectDid.did
      };

      chai.request(config.BLOCKCHAIN_URL)
        .get(utils.makeURL('project/UpdateAgent', projectDid, payloadValue))
        .end((err, res) => {
              res.should.have.status(200);
              mlog.log(JSON.stringify(res.body));
              res.body.result.code.should.be.eql(0);
        done();
      });
    });

  });

  describe('Submit a claim', () => {
    it('it should submit successfully', (done) => {
      payloadValue = {
        data:{
          claimID:"12345",
        },
        txHash:"1000001",
        senderDid:did1.did,
        projectDid:projectDid.did
      };

      chai.request(config.BLOCKCHAIN_URL)
        .get(utils.makeURL('project/CreateClaim', projectDid, payloadValue))
        .end((err, res) => {
              res.should.have.status(200);
              mlog.log(JSON.stringify(res.body));
              res.body.result.code.should.be.eql(0);
        done();
      });
    });
  });

  describe('Submit an evaluation', () => {
    const CLAIM_STATUS = {
      Pending: "0",
      Approved: "1",
      Rejected: "2",
     }

    it('it should submit successfully - Approved', (done) => {
      payloadValue = {
        data: {
          claimID:"1000005",
          status: CLAIM_STATUS.Approved
        },
        txHash:"1000001",
        senderDid:did1.did,
        projectDid:projectDid.did
      };

      chai.request(config.BLOCKCHAIN_URL)
        .get(utils.makeURL('project/CreateEvaluation', projectDid, payloadValue))
        .end((err, res) => {
              res.should.have.status(200);
              mlog.log(JSON.stringify(res.body));
              res.body.result.code.should.be.eql(0);
        done();
      });
    });

    it('it should submit successfully - Rejected', (done) => {
      payloadValue = {
        data: {
          claimID:"1000005",
          status: CLAIM_STATUS.Rejected
        },
        txHash:"1000001",
        senderDid:did1.did,
        projectDid:projectDid.did
      };

      chai.request(config.BLOCKCHAIN_URL)
        .get(utils.makeURL('project/CreateEvaluation', projectDid, payloadValue))
        .end((err, res) => {
              res.should.have.status(200);
              mlog.log(JSON.stringify(res.body));
              res.body.result.code.should.be.eql(0);
        done();
      });
    });

  });


});
  

