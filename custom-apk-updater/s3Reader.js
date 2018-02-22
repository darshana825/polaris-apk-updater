const aws = require('aws-sdk');

const reader = {
    s3: null,
    s3params: {},
    apkPattern: /([\w\.]+)-(\d+)\.apk/,
    connectS3: (options) => {

        aws.config.update({region: options.region});

        reader.s3 = new aws.S3({
            accessKeyId: options.accessKey,
            secretAccessKey: options.secretKey,
            sslEnabled: false,
            s3ForcePathStyle: true
        });

        reader.s3params = {Bucket: options.bucket};

    },
    read: (options) => {
        return new Promise((resolve, reject) => {

            if (!reader.s3) {
                reader.connectS3(options);
            }

            const S3 = reader.s3;

            S3.listObjects(reader.s3params, (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    const content = data.Contents;

                    const updates = {};

                    const availableFiles = content.reduce((filesList, file, index) => {
                        if ((content.length - 1) === index) {
                            if (reader.apkPattern.test(file.Key)) {

                                filesList.push({
                                    'version': parseInt(RegExp.$2),
                                    'filename': file.Key,
                                    'filepath': `${S3.endpoint.href}${reader.s3params.Bucket}/${file.Key}`
                                });
                            }
                        }


                        return filesList;
                    }, []);

                    updates[RegExp.$1] = availableFiles;

                    resolve(updates);
                }
            });

        });
    }
};

module.exports = {
    available: reader.read,
    connectS3: reader.connectS3
};