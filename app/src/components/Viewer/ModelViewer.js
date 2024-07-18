
"use client";
import React, { useEffect, useRef } from "react";
import * as WEBIFC from "web-ifc";
import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";

import ProjectInformation from "../bim-components/Panels/ProjectInformation";
import { Box } from "@mui/material";

const ModelViewer = () => {
  const containerRef = useRef(null);
  const componentsRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    const components = new OBC.Components();
    componentsRef.current = components;
    const worlds = components.get(OBC.Worlds);

    const world = worlds.create();
    world.scene = new OBC.SimpleScene(components);
    world.renderer = new OBC.SimpleRenderer(components, containerRef.current);
    world.camera = new OBC.SimpleCamera(components);

    components.init();

    world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10);
    world.scene.setup();

    const grids = components.get(OBC.Grids);
    grids.create(world);

    const highlighter = components.get(OBF.Highlighter);
    highlighter.setup({ world });
    highlighter.zoomToSelection = true;

    const fragments = components.get(OBC.FragmentsManager);
    const ifcLoader = components.get(OBC.IfcLoader);

    (async () => {
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

      let model;
      async function loadIfc() {
        const file = await fetch(
          "../ifc/01.ifc"
        );
        const data = await file.arrayBuffer();
        const buffer = new Uint8Array(data);
        model = await ifcLoader.load(buffer);
        model.name = "example";
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

      BUI.Manager.init();

      const projectInformationPanel = ProjectInformation(components);

      const panel = BUI.Component.create(() => {
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
            style="margin: 0 5px;" 
            label="Load IFC" 
            icon="fluent:puzzle-cube-piece-20-filled" tooltip-title="Load IFC"
            tooltip-text="Loads an IFC file into the scene. The IFC gets automatically converted to Fragments."
            @click="${() => {
              loadIfc();
            }}"
          ></bim-button>  
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
      });      

      const projectPanel = BUI.Component.create(() => {
        return BUI.html`
          <bim-tabs 
            active 
            label="IFC Loader" 
            style="position: fixed; top: 5px; left: 5px; height: auto; width: 300px;"
          > 
            <bim-tab name="project" label="Project" icon="ph:building-fill">
              ${projectInformationPanel}
            </bim-tab>
          </bim-tabs> 
        `;
      });

      document.body.append(projectPanel);
      document.body.append(panel);

      fragments.onFragmentsLoaded.add((model) => {
        console.log(model);
      });
    })();

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
