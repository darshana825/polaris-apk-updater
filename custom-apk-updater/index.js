/*const AWS = require('aws-sdk');

AWS.config.update({region: config.s3.region});

S3 = new AWS.S3({
    accessKeyId: credentials.accessKey,
    secretAccessKey: credentials.secretKey,
    endpoint: window.location.origin,
    sslEnabled: false,
    s3ForcePathStyle: true
});*/

const s3Reader = require('./s3Reader');

function run(app, route, options) {

    s3Reader.connectS3(options);

    app.get(route, (req, res) => {

        s3Reader.available(options).then((updates) => {
            res.status(200).json(updates);
        }).catch((error) => {
            console.log('error : ', error);
            res.status(403).send('Bad implementation');
        });

    });
}

module.exports = {
    run: run
};
