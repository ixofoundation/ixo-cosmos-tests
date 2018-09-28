let sov = require('sovrin-did');

var makeURL = function(type, signingDid, payloadValue, goodSignature = true){
  doc = {
    payload: [
      {
        type: type,
        value: payloadValue
      }
    ],
    signatures:createSignatures(signingDid, payloadValue, goodSignature)
  }

  let hexDoc = Buffer.from(JSON.stringify(doc)).toString('hex');
  return '/broadcast_tx_sync?tx=0x' + hexDoc;
}

var signMessage = function(did, payloadValue){
  let msg = JSON.stringify(payloadValue)
  let signature = sov.signMessage(msg, did.secret.signKey, did.verifyKey);
  let signatureHex = Buffer.from(signature).slice(0,64).toString('base64');
  return signatureHex
}

var createSignatures = function(did, payloadValue, goodSignature = true) {
  payload = goodSignature? payloadValue : {fake: "test"};

  return [
    {
      signatureValue: signMessage(did, payload),
      created: newDateAsJSON()
    }
  ];
}

var newDateAsJSON = function(){
  return (new Date).toJSON();
}

var createDidTx = function(did){
  let payloadValue = {
    didDoc: {
      "did": did.did,
      "pubKey": did.verifyKey,
      "credentials": []
    }
  };
  return makeURL('did/AddDid', did, payloadValue);
}



module.exports = {
  newDateAsJSON:newDateAsJSON,
  makeURL:makeURL,
  signMessage:signMessage,
  createSignatures:createSignatures,
  createDidTx:createDidTx
};
