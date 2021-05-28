import ReactPanelContent from './ReactPanelContent'
import ReactDOM from 'react-dom'
import React, { useState }  from 'react'
const Autodesk = window.Autodesk;

export default class ReactPanel extends Autodesk.Viewing.UI.DockingPanel {
  DOMContent: HTMLDivElement
  viewer?: any
  options?: any
  reactNode?: any


  constructor(viewer: any, options: any) {
    super(viewer.container, options.id, options.title, {
      addFooter: false,
      viewer
    })
    
    this.container.classList.add('ReactDockingPanel');
    this.DOMContent = document.createElement('div');
    this.DOMContent.className = 'content';
    this.container.appendChild(this.DOMContent);
    this.options = options;
    this.viewer = viewer;
    
  }

  initialize() {
    super.initialize()
    this.viewer = this.options.viewer
    this.footer = this.createFooter()
    this.container.appendChild(
      this.footer)
  }


  setVisible(show: boolean) {
    super.setVisible(show)

    let viewer = this.viewer;

    if (show) {

      this.reactNode = ReactDOM.render(
        <ReactPanelContent viewer={viewer} />,
        this.DOMContent)

    } else if (this.reactNode) {

      ReactDOM.unmountComponentAtNode(
        this.DOMContent)

      this.reactNode = null
    }
  }

  

}