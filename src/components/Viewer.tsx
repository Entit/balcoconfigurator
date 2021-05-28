
import * as React from 'react';

export interface ViewerState {
  view: any;
}
interface Token {
  access_token: string;
  expires_in: number;
}

class Viewer extends React.Component {
  urn?: string;
  viewer?: Autodesk.Viewing.GuiViewer3D;

  constructor(props: any) {
    super(props);

    this.urn = "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6d2ViY29uZmlndXJhdG9ybmV3L21vZGVsXzZ4My56aXA";
    this.state = {
      view: null
    }
  }

  render() {
    return (
      <div className="Viewer" id="viewerContainer"></div>
    );
  }

  onDocumentLoadError(error: any) {
    console.log(`Error loading a document: ${error}`);
  }

  /* after the viewer loads a document, we need to select which viewable to
  display in our component */
  async onDocumentLoadSuccess(doc: Autodesk.Viewing.Document) {
    var items = doc.getRoot().search({
      'type': 'geometry',
      'role': '3d'
    });

    if (items.length === 0) {
      console.error('Document contains no viewables');
      return;
    }

    var viewerDiv: any = document.getElementById('viewerContainer');
    this.viewer = new Autodesk.Viewing.GuiViewer3D(viewerDiv);
    this.viewer.start();

    const { PropertiesExtension } = await import('./PropertiesExtension');
    PropertiesExtension.register();
    this.viewer.loadExtension("PropertiesExtension");


    var options2 = {};
    let that: any = this;
    this.viewer.loadDocumentNode(doc, items[0], options2);
  }
  getForgeToken():Promise<Token> {
    return fetch('/api/forge/oauth/token')
      .then(data => data.json());
  }

  /* Once the viewer has initialized, it will ask us for a forge token so it can
  access the specified document. */
  handleTokenRequested(onTokenCallback: (accessToken:string, expiresIn:number)=> void) {
    console.log('Token requested by the viewer.');
    if (onTokenCallback) {
      this.getForgeToken()
        .then((token) => onTokenCallback(token.access_token, token.expires_in));
    }
  }

  componentDidMount() {
    if (!window.Autodesk) {
      this.loadCss('https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/style.min.css');
      this.loadScript('https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.min.js')
        .onload = () => {
          this.onScriptLoaded();
        }
    }
  }

  public loadCss(src: string): HTMLLinkElement {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = src;
    link.type = "text/css";
    document.head.appendChild(link);
    return link;
  }

  public loadScript(src: string): HTMLScriptElement {
    const script = document.createElement("script");
    script.src = src;
    script.type = "text/javascript";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    return script;
  }

  public onScriptLoaded() {
    let that: any = this;
    var options = {
      env: "AutodeskProduction",
      getAccessToken: that.handleTokenRequested.bind(that)
    };
    var documentId: string = that.urn;
    Autodesk.Viewing.Initializer(options, function onInitialized() {
      Autodesk.Viewing.Document.load(documentId, that.onDocumentLoadSuccess.bind(that), that.onDocumentLoadError);
    });
  }

  public getURN(onURNCallback: any) {
    //implement get urn call
    return this.urn;
  }


};

export default Viewer;