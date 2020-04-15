const AWS = require('aws-sdk');
const uuid = require('uuid');
const {MWAError} = require('../utils/MWAError');

const s3 = new AWS.S3();
const bucketName = "mwa-image";

exports.uploadFile = (file,fileExtension,callback,errCallBack) => {
    var fileName = uuid.v4()+fileExtension;
    var params = {Bucket: bucketName, Key: fileName, Body: file};
    s3.upload(params,function(err,data){
        if(err)
        {
            errCallBack(new MWAError(500,"Failed to upload image, Please try again"));
        }
        callback(fileName,data);
    });
}

exports.downloadFile = (file,callback,errCallBack) => {
    try
    {
        var params = {Bucket: bucketName, Key: file};    
        callback(s3.getObject(params).createReadStream());
    }
    catch(err)
    {
        errCallBack(new MWAError(500,"Failed to download image, Please try again"));
    }
}
