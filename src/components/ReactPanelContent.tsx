import React from 'react'
import '../App.css';
import Axios from 'axios'
import querystring from 'querystring'

export interface ReactPanelContentProps {
  viewer: any;
}

class ReactPanelContent extends React.Component<ReactPanelContentProps, {}> {
  viewer?: any
  config?: any
  inputSignUrl?: string
  access_token?: string
  constructor(props: any) {
    super(props);
    this.viewer = props.viewer;

  }
  getAccessToken(docName:string, paramJSON:string) {
    let inputBucketName = 'd1sfnergmbzannxr1zsgushii1h4zalw_ainput';
    let uploadZipName = 'BalcoTemplate.zip';
    let that = this
    
    Axios({
      method: 'POST',
      url: 'https://developer.api.autodesk.com/authentication/v1/authenticate',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      data: querystring.stringify({
        client_id: 'd1SfNerGmBZAnNxR1zsGuSHiI1H4zAlw',
        client_secret: 'bq5qR3M883n5r2Fb',
        grant_type: 'client_credentials',
        scope: 'data:read data:write data:create bucket:create bucket:read'
      })
    })
      .then(function (response) {
        // Success
        that.access_token = response.data.access_token;
        Axios({
          method: 'POST',
          url: 'https://developer.api.autodesk.com/oss/v2/buckets/' + encodeURIComponent(inputBucketName) + '/objects/' + encodeURIComponent(uploadZipName) + '/signed',
          headers: {
            Authorization: 'Bearer ' + that.access_token,
            'content-type': 'application/json'
          },
          data: {}
        })
          .then(function (response) {
            // Success
            // console.log(response);
            console.log('Success');
            that.inputSignUrl = response.data.signedUrl;
            console.log('Success signing input zip    : ' + that.inputSignUrl);
            that.sendConfig(docName, paramJSON);

          })
          .catch(function (error) {
            // Failed
            console.log('Failed');
            console.log(error);
            console.log('Failed signing input zip');
          });
      })
      .catch(function (error) {
        // Failed
        console.log('oauth     :  ' + error);
      });
  }

  sendParameters() {
    let name: any = document.getElementById('docName');
    let docName: string = name.value;
    docName = docName + ".ifc";
    let widthInput: any = document.getElementById("myWidth");
    let widthVal = widthInput.value;
    let depthInput: any = document.getElementById("myDepth");
    let depthVal = depthInput.value;
    var params = {
      'balconyDepth': depthVal,
      'balconyWidth': widthVal
    };
    let paramJSON = 'data:application/json,' + JSON.stringify(params);
    this.getAccessToken(docName, paramJSON);
    
  }
  sendConfig(docName: string, paramJSON: string) {
    let activityID = 'BalcoActivity';
    let qualifiedName = 'd1SfNerGmBZAnNxR1zsGuSHiI1H4zAlw.' + activityID + '+beta';
    let outputBucketName = 'd1sfnergmbzannxr1zsgushii1h4zalw_aoutput';
    let that = this;
    let text = JSON.stringify({
      'activityId': qualifiedName,
      'arguments': {
        'rvtFile': {
          'url': that.inputSignUrl,
          'pathInZip': 'BalcoTemplate.rvt'
        },
        'RevitParams': {
          'url': paramJSON//'data:application/json,' + JSON.stringify({ 'balconyDepth':  _depth, 'balconyWidth': _width})
        },
        'OutputIFC': {
          'url': 'https://developer.api.autodesk.com/oss/v2/buckets/' + encodeURIComponent(outputBucketName) + '/objects/' + encodeURIComponent(docName),
          'headers': {
            'Authorization': 'Bearer ' + that.access_token,
            'Content-type': 'application/octet-stream'
          },
          'verb': 'put'
        },
        'onComplete': {
          'verb': 'post',
          'url': 'https://balcoconfigurator.azurewebsites.net/api/forge/datamanagement/signanddownloadIFC'
        }
      }
    });
    Axios({
      method: 'POST',
      url: 'https://developer.api.autodesk.com/da/us-east/v3/workitems',
      headers: {
        'Authorization': 'Bearer ' + that.access_token,
        'content-type': 'application/json'
      },
      data: text
    })
      .then(function (response) {
        // Success hehe
        console.log(response);
        console.log('Success creating new work item');
      })
      .catch(function (error) {

        // Failed
        console.log('Failed to create new work item');
        console.log(error);
        console.log('Failed to create new work item');
      })
  }

  onDocumentLoadError(error: any) {
    console.log(`Error loading a document: ${error}`);
  }

  download() {
    let name: any = document.getElementById('docName');
    let docName: string = name.value;
    docName = docName + ".ifc";
    window.location.href = 'https://balcoconfigurator.azurewebsites.net/' + docName
  }
  onInputWidth() {
    let widthInput: any = document.getElementById("myWidth");
    let widthVal = widthInput.value;
    let depthInput: any = document.getElementById("myDepth");
    let depthVal = depthInput.value;
    let documentId = "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6d2ViY29uZmlndXJhdG9ybmV3L21vZGVsXzZ4My56aXA";
    let that: any = this;
    let viewer: any = this.viewer;

    if (depthVal === 5 && widthVal === 8) {
      documentId = "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6d2ViY29uZmlndXJhdG9ybmV3L21vZGVsXzh4NS56aXA"
    }
    else if (depthVal === 5 && widthVal === 6) {
      documentId = "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6d2ViY29uZmlndXJhdG9ybmV3L21vZGVsXzZ4NS56aXA"
    }
    else if (depthVal === 4 && widthVal === 7) {
      documentId = "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6d2ViY29uZmlndXJhdG9ybmV3L21vZGVsXzd4NC56aXA"
    }
    else if (depthVal === 3 && widthVal === 6) {
      documentId = "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6d2ViY29uZmlndXJhdG9ybmV3L21vZGVsXzZ4My56aXA"
    }
    else if (depthVal === 4 && widthVal === 6) {
      documentId = "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6d2ViY29uZmlndXJhdG9ybmV3L21vZGVsXzZ4NC56aXA"
    }
    else if (depthVal === 3 && widthVal === 7) {
      documentId = "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6d2ViY29uZmlndXJhdG9ybmV3L21vZGVsXzd4My56aXA"
    }
    else if (depthVal === 5 && widthVal === 7) {
      documentId = "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6d2ViY29uZmlndXJhdG9ybmV3L21vZGVsXzd4NS56aXA"
    }
    else if (depthVal === 3 && widthVal === 8) {
      documentId = "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6d2ViY29uZmlndXJhdG9ybmV3L21vZGVsXzh4My56aXA"
    }
    else if (depthVal === 4 && widthVal === 8) {
      documentId = "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6d2ViY29uZmlndXJhdG9ybmV3L21vZGVsXzh4NC56aXA"
    }
    else if (depthVal === 3 && widthVal === 9) {
      documentId = "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6d2ViY29uZmlndXJhdG9ybmV3L21vZGVsXzl4My56aXA"
    }
    else if (depthVal === 4 && widthVal === 9) {
      documentId = "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6d2ViY29uZmlndXJhdG9ybmV3L21vZGVsXzl4NC56aXA"
    }
    else if (depthVal === 5 && widthVal === 9) {
      documentId = "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6d2ViY29uZmlndXJhdG9ybmV3L21vZGVsXzl4NS56aXA"
    }
    else if (depthVal === 3 && widthVal === 10) {
      documentId = "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6d2ViY29uZmlndXJhdG9ybmV3L21vZGVsXzEweDMuemlw"
    }
    else if (depthVal === 4 && widthVal === 10) {
      documentId = "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6d2ViY29uZmlndXJhdG9ybmV3L21vZGVsXzEweDQuemlw"
    }
    else if (depthVal === 5 && widthVal === 10) {
      documentId = "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6d2ViY29uZmlndXJhdG9ybmV3L21vZGVsXzEweDUuemlw"
    }
    else if (depthVal === 3 && widthVal === 11) {
      documentId = "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6d2ViY29uZmlndXJhdG9ybmV3L21vZGVsXzExeDMuemlw"
    }
    else if (depthVal === 4 && widthVal === 11) {
      documentId = "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6d2ViY29uZmlndXJhdG9ybmV3L21vZGVsXzExeDQuemlw"
    }
    else if (depthVal === 5 && widthVal === 11) {
      documentId = "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6d2ViY29uZmlndXJhdG9ybmV3L21vZGVsXzExeDUuemlw"
    }
    else if (depthVal === 3 && widthVal === 12) {
      documentId = "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6d2ViY29uZmlndXJhdG9ybmV3L21vZGVsXzEyeDMuemlw"
    }
    else if (depthVal === 4 && widthVal === 12) {
      documentId = "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6d2ViY29uZmlndXJhdG9ybmV3L21vZGVsXzEyeDQuemlw"
    }
    else if (depthVal === 5 && widthVal === 12) {
      documentId = "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6d2ViY29uZmlndXJhdG9ybmV3L21vZGVsXzEyeDUuemlw"
    }

    Autodesk.Viewing.Document.load(documentId, (doc) => {
      var items = doc.getRoot().search({
        'type': 'geometry',
        'role': '3d'
      });

      if (items.length === 0) {
        console.error('Document contains no viewables');
        return;
      }

      var options2 = {};
      viewer.loadDocumentNode(doc, items[0], options2);
    }, that.onDocumentLoadError);


  }
  render() {
    return (
      <div className="react-content" >
        <div className="height-container">
          <p>Depth</p>
          <input type="range" min="3" max="5" defaultValue="5" id="myDepth" onInput={this.onInputWidth.bind(this)}></input>
        </div>
        <div className="width-container">
          <p>Width</p>
          <input type="range" min="6" max="12" defaultValue="7" id="myWidth" onInput={this.onInputWidth.bind(this)}></input>
        </div>
        <div className="request-container">
          <input type="text" id="docName" className="doc" name="docName" /><label>.ifc</label>
          <button className="request-button" id="Apply" onClick={this.sendParameters.bind(this)}>Order file</button>
          <button className="request-button" onClick={this.download}>Download</button>
        </div>
      </div >
    )
  }
}

export default ReactPanelContent