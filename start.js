const path = require('path');
const express = require('express');
var Axios = require('axios');
var bodyParser = require('body-parser');
let app = express();
var fs = require('fs');

const PORT = process.env.PORT || 3000;
const config = require('./src/config.js');
if (config.credentials.client_id == null || config.credentials.client_secret == null) {
    console.error('Missing FORGE_CLIENT_ID or FORGE_CLIENT_SECRET env. variables.');
    return;
}

app.use(express.static(path.join(__dirname, 'build')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.use(express.json({ limit: '50mb' }));
app.use('/api/forge/oauth', require('./routes/oauth'));
app.use('/api/forge/oss', require('./routes/oss'));
app.use('/api/forge/modelderivative', require('./routes/modelderivative'));
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.statusCode).json(err);
});
app.listen(PORT, () => { console.log(`Server listening on port ${PORT}`); });

var alias = 'beta';
//-------------------------------------------------------------------
// Configuration for your Forge account
// Initialize the 2-legged OAuth2 client, and
// set specific scopes
//------------------------------------------------------------------

var FORGE_CALLBACK_HOST = 'https://balcoconfigurator.azurewebsites.net';
var access_token = '';
var scopes = 'data:read data:write data:create bucket:create bucket:read';
const querystring = require('querystring');

var paramJSON = "";
var _width = 9;
var _depth = 3;

var activityID = 'BalcoActivity';
var qualifiedName = config.credentials.client_id + '.' + activityID + '+' + alias;
var inputBucketName = config.credentials.client_id.toLowerCase() + '_ainput';
var outputBucketName = config.credentials.client_id.toLowerCase() + '_aoutput';
var uploadZipName = 'BalcoTemplate.zip';
var revitFileName = 'BalcoTemplate.rvt';
var ifcName = 'BalonyExport.ifc';
var exportName = '';
var ifcSignedUrl = '';

var resultIfcUrl = 'https://developer.api.autodesk.com/oss/v2/' + "buckets/" + encodeURIComponent(outputBucketName) + '/objects/' + encodeURIComponent(ifcName);
var inputSignUrl = '';
app.use(express.static('public'))


app.get('/api/forge/oauth', function (req, res) {
    Axios({
        method: 'POST',
        url: 'https://developer.api.autodesk.com/authentication/v1/authenticate',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
        },
        data: querystring.stringify({
            client_id: config.credentials.client_id,
            client_secret: config.credentials.client_secret,
            grant_type: 'client_credentials',
            scope: scopes
        })
    })
        .then(function (response) {
            // Success
            access_token = response.data.access_token;
            Axios({
                method: 'POST',
                url: 'https://developer.api.autodesk.com/oss/v2/buckets/' + encodeURIComponent(inputBucketName) + '/objects/' + encodeURIComponent(uploadZipName) + '/signed',
                headers: {
                    Authorization: 'Bearer ' + access_token,
                    'content-type': 'application/json'
                },
                data: {}
            })
                .then(function (response) {
                    // Success
                    // console.log(response);
                    console.log('Success');
                    inputSignUrl = response.data.signedUrl;
                    console.log('Success signing input zip    : ' + inputSignUrl);
        
                })
                .catch(function (error) {
                    // Failed
                    console.log('Failed');
                    console.log(error);
                    console.log('Failed signing input zip');
                });
            console.log(response);
        })
        .catch(function (error) {
            // Failed
            console.log('oauth     :  ' + error);
            res.send('Failed to authenticate');
        });
});


function signInput() {
    //app.get('/api/forge/datamanagement/signandworkitemInventor', function(req, res){
    console.log('Start signing uploadZip');
    Axios({
        method: 'POST',
        url: 'https://developer.api.autodesk.com/oss/v2/buckets/' + encodeURIComponent(inputBucketName) + '/objects/' + encodeURIComponent(uploadZipName) + '/signed',
        headers: {
            Authorization: 'Bearer ' + access_token,
            'content-type': 'application/json'
        },
        data: {}
    })
        .then(function (response) {
            // Success
            // console.log(response);
            console.log('Success');
            inputSignUrl = response.data.signedUrl;
            console.log('Success signing input zip    : ' + inputSignUrl);

        })
        .catch(function (error) {
            // Failed
            console.log('Failed');
            console.log(error);
            console.log('Failed signing input zip');
        });

}


app.get('/api/forge/sendconfig', function (req, res) {

    if (exportName != '') {
        resultIfcUrl = 'https://developer.api.autodesk.com/oss/v2/' + "buckets/" + encodeURIComponent(outputBucketName) + '/objects/' + encodeURIComponent(exportName);
    }

    console.log(resultIfcUrl);

    let text = JSON.stringify({
        'activityId': qualifiedName,
        'arguments': {
            'rvtFile': {
                'url': inputSignUrl,
                'pathInZip': revitFileName
            },
            'RevitParams': {
                'url': paramJSON//'data:application/json,' + JSON.stringify({ 'balconyDepth':  _depth, 'balconyWidth': _width})
            },
            'OutputIFC': {
                'url': resultIfcUrl,
                'headers': {
                    'Authorization': 'Bearer ' + access_token,
                    'Content-type': 'application/octet-stream'
                },
                'verb': 'put'
            },
            'onComplete': {
                'verb': 'post',
                'url': FORGE_CALLBACK_HOST + '/api/forge/datamanagement/signanddownloadIFC'
            }
        }
    });

    Axios({
        method: 'POST',
        url: 'https://developer.api.autodesk.com/da/us-east/v3/workitems',
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'content-type': 'application/json'
        },
        data: text
    })
        .then(function (response) {
            // Success
            console.log(response);
            console.log('Success creating new work item');
            res.sendStatus(204);
        })
        .catch(function (error) {

            // Failed
            console.log('Failed to create new work item');
            console.log(error);
            console.log('Failed to create new work item');
        })
});

app.post('/api/forge/datamanagement/signanddownloadIFC', function (req, res) {
    console.log('Signing IFC');
    Axios({
        method: 'POST',
        url: resultIfcUrl + '/signed',
        headers: {
            Authorization: 'Bearer ' + access_token,
            'content-type': 'application/json'
        },
        data: {}
    })
        .then(function (response) {
            // Success
            ifcSignedUrl = response.data.signedUrl;
            downloadIfc();
            console.log('Success signing ifc');
            res.sendStatus(204);
        })
        .catch(function (error) {
            // Failed
            console.log('Failed signing ifc');
            console.log(error);
            console.log('Failed signing ifc');
        });

});


app.post('/htmlvalues', function (req, res) {
    paramJSON = 'data:application/json,' + JSON.stringify(req.body);
    console.log(paramJSON);
    res.sendStatus(204);
});

app.post('/docname', function (req, res) {
    console.log(req);
    var temp = JSON.stringify(req.body);
    exportName = JSON.parse(temp).docname;
    console.log("Name: " + exportName);
    res.sendStatus(204);
});


function downloadIfc() {
    if (exportName == '') {
        exportName = ifcName;
    }
    console.log(ifcSignedUrl)
    console.log("Name: " + exportName)
    let pdfPath = path.join('/home/site/wwwroot/public', exportName)
    console.log(pdfPath)
    Axios({
        method: 'GET',
        url: ifcSignedUrl,
        responseType: 'stream'
    })
        .then(function (response) {
            // Success
            response.data.pipe(fs.createWriteStream(pdfPath))
            console.log('Success downloading ifc')

        })
        .catch(function (error) {
            // Failed
            console.log('Failed downloading ifc')
            console.log(error);
            console.log('Failed downloading ifc')
        });

}
