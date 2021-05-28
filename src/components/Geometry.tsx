import React from 'react'
import * as THREE from 'three';

export class GeometryExtension extends Autodesk.Viewing.Extension {

  constructor(viewer?: any, options?: any) {
    super(viewer, options)

  }

  getGeometryId() {
    const tree = this.viewer.model.getInstanceTree();
    if (tree) { // Could be null if the tree hasn't been loaded yet
      const selectedIds = this.viewer.getSelection();
      for (const dbId of selectedIds) {
        const fragIds:any = [];
        tree.enumNodeFragments(
          dbId,
          function (fragId) { fragIds.push(fragId); },
          false
        );
        console.log('dbId:', dbId, 'fragIds:', fragIds);
        this.modifyFragmentTransform(fragIds)
      }
    }
  }

  modifyFragmentTransform(fragId:number) {
    let frags = this.viewer.model.getFragmentList();
    let scale = new THREE.Vector3();
    let rotation = new THREE.Quaternion();
    let translation = new THREE.Vector3();
    frags.getAnimTransform(fragId, scale, rotation, translation);
    translation.x += 10.0;
    scale.x = scale.y = scale.z = 1.0;
    frags.updateAnimTransform(fragId, scale, rotation, translation);
  }

  load() {
    let getGeometryIdBinded = this.getGeometryId.bind(this);
    this.viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, getGeometryIdBinded);
    return true
  }
  unload() {
    let getGeometryIdBinded = this.getGeometryId.bind(this);
    this.viewer.removeEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, getGeometryIdBinded);
    return true
  }

  static register() {
    Autodesk.Viewing.theExtensionManager.registerExtension(
      "GeometryExtension",
      GeometryExtension
    );
  }


}



export default GeometryExtension