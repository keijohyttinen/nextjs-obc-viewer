
"use client";
import React, { useEffect, useRef } from "react";
import * as WEBIFC from "web-ifc";
import * as CUI from "@thatopen/ui-obc";
import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as THREE from 'three';

import ProjectInformation from "../bim-components/Panels/ProjectInformation";
import { Box } from "@mui/material";
import Camera from "../bim-components/Toolbars/Sections/Camera";
import Selection from "../bim-components/Toolbars/Sections/Selection";
import { AppManager } from "../bim-components/AppManager";
import { loadModelByUrl } from "./viewer";

// Safari has issue:
// TypeError: fileHandle.createWritable is not a function. (In 'fileHandle.createWritable()', 'fileHandle.createWritable' is undefined)
// https://github.com/ThatOpen/engine_components/issues/508

// Use url:
// - http://localhost:3005?source=https://raw.githubusercontent.com/ThatOpen/engine_components/refs/heads/main/resources/streaming/small.ifc-processed.json
// - http://localhost:3005?source=http://localhost:3000/files/models/BwFYh7Gh/ifc-processed.json


const ModelViewer = () => {


  const containerRef = useRef(null);
  const componentsRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    // See https://github.com/ThatOpen/engine_templates/blob/main/templates/vanilla/src/main.ts

    BUI.Manager.init();

    const components = new OBC.Components();
    componentsRef.current = components;
    const worlds = components.get(OBC.Worlds);

    const viewport = document.createElement("bim-viewport");
    viewport.name = "viewer";

    const world = worlds.create();
    world.scene = new OBC.SimpleScene(components);
    world.scene.setup();
    world.renderer = new OBC.SimpleRenderer(components, containerRef.current);
    //world.renderer = new OBF.PostproductionRenderer(components, containerRef.current);
    const { postproduction } = world.renderer;

    world.camera = new OBC.SimpleCamera(components);
    //world.camera = new OBC.OrthoPerspectiveCamera(components);
    
    /*const viewCube = document.createElement("bim-view-cube");
    viewCube.camera = world.camera.three;
    viewport.append(viewCube);

    world.camera.controls.addEventListener("update", () => {
      if(viewCube){
        viewCube.updateOrientation();
      }
    });*/

    components.init();

    const grids = components.get(OBC.Grids);
    grids.create(world);

    const currentUrl = window.location.href;

    // Parse the URL
    const url = new URL(currentUrl);
  
    // Get the "source" query parameter
    let sourceUrl = url.searchParams.get("source");
    //sourceUrl = "https://raw.githubusercontent.com/ThatOpen/engine_components/refs/heads/main/resources/streaming/small.ifc-processed.json"

    const baseUrl = sourceUrl.slice(0, sourceUrl.lastIndexOf("/") + 1);

    const tilesLoader = components.get(OBF.IfcStreamer);
    tilesLoader.world = world;
    tilesLoader.url = baseUrl;
    tilesLoader.useCache = true;
    tilesLoader.culler.threshold = 20;
    tilesLoader.culler.maxHiddenTime = 1000;
    tilesLoader.culler.maxLostTime = 40000;
  
    world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10);
    world.camera.controls.addEventListener("sleep", () => {
      tilesLoader.culler.needsUpdate = true;
    });

    const culler = components.get(OBC.Cullers).create(world);

    world.camera.controls.restThreshold = 0.25;
    world.camera.controls.addEventListener("rest", () => {
      culler.needsUpdate = true;
      tilesLoader.culler.needsUpdate = true;
    });

    
    document.addEventListener("keydown", (event) => {
      if (world){
        if (event.key === 'w' || event.key === 'W') {
          world.camera.controls.forward(0.25, true)
        }
        else if (event.key === 's' || event.key === 'S') {
          world.camera.controls.forward(-0.25, true)
        }
        else if (event.key === 'a' || event.key === 'A') {
          world.camera.controls.rotateAzimuthTo( -30 * THREE.MathUtils.DEG2RAD, true );
        }
        else if (event.key === 'd' || event.key === 'D') {
          world.camera.controls.rotateAzimuthTo( 30 * THREE.MathUtils.DEG2RAD, true );
        }
      }
    });

    const highlighter = components.get(OBF.Highlighter);
    highlighter.setup({ world });
    highlighter.zoomToSelection = true;

    const fragments = components.get(OBC.FragmentsManager);

    const loadBimUiBasic = async () => {

      await loadModelByUrl(sourceUrl, tilesLoader);

      const projectInformationPanel = ProjectInformation(components);
      
      const ifcLoader = components.get(OBC.IfcLoader);
      await ifcLoader.setup();

      const excludedCats = [
        WEBIFC.IFCTENDONANCHOR,
        WEBIFC.IFCREINFORCINGBAR,
        WEBIFC.IFCREINFORCINGELEMENT,
      ];

      for (const cat of excludedCats) {
        ifcLoader.settings.excludedCategories.add(cat);
      }

      ifcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;
      ifcLoader.settings.webIfc.OPTIMIZE_PROFILES = true;

      async function loadIfc(filepath) {
        const file = await fetch(
          filepath
        );
        const data = await file.arrayBuffer();
        const buffer = new Uint8Array(data);
        const model = await ifcLoader.load(buffer);
        model.name = filepath //"example";
        world.scene.three.add(model);
        const indexer = components.get(OBC.IfcRelationsIndexer);
        await indexer.process(model);
      }

      const onIfcUpload = () => {
        const fileOpener = document.createElement("input");
        fileOpener.type = "file";
        fileOpener.accept = ".ifc";
        fileOpener.onchange = async () => {
          if (fileOpener.files === null || fileOpener.files.length === 0)
            return;
          const file = fileOpener.files[0];
          fileOpener.remove();
          const buffer = await file.arrayBuffer();
          const data = new Uint8Array(buffer);
          const model = await ifcLoader.load(data);
          model.name = file.name.replace(".ifc", "");
          world.scene.three.add(model);
          const indexer = components.get(OBC.IfcRelationsIndexer);
          await indexer.process(model);
        };
        fileOpener.click();
      };

      function download(file) {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(file);
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
      
      async function exportFragments() {
        if (!fragments.groups.size) {
          return;
        }
        const group = Array.from(fragments.groups.values())[0];
        const data = fragments.export(group);
        download(new File([new Blob([data])], "small.frag"));

        const properties = group.getLocalProperties();
        if (properties) {
          download(new File([JSON.stringify(properties)], "small.json"));
        }
      }

      function disposeFragments() {
        fragments.dispose();
      } 

      const buttonPanel = BUI.Component.create(() => {
        return BUI.html`
          <bim-toolbar-section 
            active 
            style="
              position: fixed; 
              bottom: 0; 
              left: 50%; 
              transform: translateX(-50%); 
              padding: 10px 0;
              overflow: hidden;
            "
          >
          <bim-toolbar-section 
            style="
              display: flex; 
              justify-content: center; 
              padding-top: 100vh;
              flex-direction: row;  
            "
          >
          <bim-button
          data-ui-id="import-ifc"
          label="Upload IFC"
          icon="mage:box-3d-fill"
          tooltip-text="Loads an IFC file locally."
          style="margin: 0 5px;" 
          @click="${() => {
              onIfcUpload();
            }}"
          ></bim-button>
          <bim-button 
            style="margin: 0 5px;" 
            icon="ph:export-bold" 
            label="Export"
            tooltip-title="Export fragment" 
            @click="${() => {
              exportFragments();
            }}"
          ></bim-button>  
          <bim-button 
            style="margin: 0 5px;" 
            label="Dispose" 
            tooltip-title="Dispose fragment" 
            icon="wpf:delete"
            @click="${() => {
              disposeFragments();
            }}"
          ></bim-button>
          </bim-panel-section>
          </bim-toolbar-section>
        `;
      })

      const projectPanel = BUI.Component.create(() => {
        return BUI.html`
          <bim-tabs 
            active 
            label="IFC Loader" 
            style="position: fixed; top: 5px; left: 5px; height: auto; width: 500px;"
          > 
            <bim-tab name="project" label="Project" icon="ph:building-fill">
              ${projectInformationPanel}
            </bim-tab>
            <bim-tab label="Selection">
              <bim-toolbar>
                ${Camera(world)}
                ${Selection(components, world)}
              </bim-toolbar>
            </bim-tab>
          </bim-tabs> 
        `;
      });

      const toolbar = BUI.Component.create(() => {
        return BUI.html`
          <bim-tabs floating style="justify-self: center; border-radius: 0.5rem;">
          </bim-tabs>
        `;
      });


      const appManager = components.get(AppManager);
      const viewportGrid = appManager.grids.get("viewport");

      const [classificationsTree, updateClassificationsTree] = CUI.tables.classificationTree({
        components,
        classifications: [],
      });
      const panel2 = BUI.Component.create(() => {
        return BUI.html`
         <bim-panel label="Classifications Tree">
          <bim-panel-section label="Classifications">
            ${classificationsTree}
          </bim-panel-section>
         </bim-panel> 
        `;
      });

      const [modelsList] = CUI.tables.modelsList({
        components,
        tags: { schema: true, viewDefinition: false },
        actions: { download: false },
      });

      const panel3 = BUI.Component.create(() => {
        const [loadIfcBtn] = CUI.buttons.loadIfc({ components });
      
        return BUI.html`
         <bim-panel label="IFC Models" style="position: fixed; top: 5px; left: 5px; height: auto; width: 500px;">
          <bim-panel-section label="Importing">
            ${loadIfcBtn}
          </bim-panel-section>
          <bim-panel-section icon="mage:box-3d-fill" label="Loaded Models">
            ${modelsList}
          </bim-panel-section>
         </bim-panel> 
        `;
      });

      const app = document.createElement("bim-grid");
      app.layouts = {
        main: {
          template: `
            "projectPanel viewport" 
            / 25rem 1fr
            "panel3"
            "buttonPanel"
          `,
          elements: {  projectPanel, buttonPanel,  viewport }, //panel3, 
        },
      };

      app.layout = "main";
      document.body.append(app);


      //document.body.append(projectPanel);
      //document.body.append(panel);
      

      /*fragments.onFragmentsLoaded.add((model) => {
        console.log(model);
      });*/
    }

    loadBimUiBasic()
  

    return () => {
      components.dispose();
    };
  }, []);

  return (
    <>
      <Box
        id="container"
        ref={containerRef}
        style={{ width: "100%", height: "100%", overflow: "hidden" }}
      />
    </>
  );
};

export default ModelViewer;
