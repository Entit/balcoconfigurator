import ReactPanel from './ReactPanel';

export class PropertiesExtension extends Autodesk.Viewing.Extension {
    panel?: any;

    constructor (viewer: any, options: any) {
    super (viewer, options)

    
    }
    

    createUI() {
        let viewer = this.viewer;
        let panel = this.panel
        let toolbarButtonShowDockingPanel = new Autodesk.Viewing.UI.Button('showReactPanel');
            toolbarButtonShowDockingPanel.onClick = function (e) {
                if (panel == null) {
                    panel = new ReactPanel(viewer, {
                        id: 'react-panel-id',
                        title: 'React Panel'
                    })
                }
                panel.setVisible(!panel.isVisible());
            };
        toolbarButtonShowDockingPanel.addClass('myAwesomeToolbarButton');
        toolbarButtonShowDockingPanel.setToolTip('Input height and width');
        
        let subToolbar = new Autodesk.Viewing.UI.ControlGroup('MyAwesomeAppToolbar');
        subToolbar.addControl(toolbarButtonShowDockingPanel);
        
        viewer.toolbar.addControl(subToolbar);
    }
    onToolbarCreated() {
        this.createUI();
    }
    load() {
        if (this.viewer.toolbar) {
            this.createUI();
        } else {
            
        }
        console.log('loaded')
        return true;
    }

    unload() {
        console.log('unloaded');
        return true;
    }

    static register() {
        Autodesk.Viewing.theExtensionManager.registerExtension(
            "PropertiesExtension",
            PropertiesExtension
        );
    }
}