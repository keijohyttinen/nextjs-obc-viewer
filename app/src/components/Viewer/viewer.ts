import * as OBCF from "@thatopen/components-front";

const SERVER_BASE_URL = "http://localhost:3000/files/models";

// Document https://docs.thatopen.com/Tutorials/Components/Front/IfcStreamer

export async function loadModelByUrl(geometryURL: string, components: any, world: any) {
  

  const baseUrl = geometryURL.slice(0, geometryURL.lastIndexOf("/") + 1);

  const loader = components.get(OBCF.IfcStreamer);
  loader.world = world;

  world.camera.controls.addEventListener("sleep", () => {
    loader.culler.needsUpdate = true;
  });

  const rawGeometryData = await fetch(geometryURL);
  const geometryData = await rawGeometryData.json();
  let propertiesData;
  if (baseUrl) {
    const propertiesURL = baseUrl + "ifc-processed-properties.json"
    const rawPropertiesData = await fetch(propertiesURL);
    propertiesData = await rawPropertiesData.json();
  }

  /*
  You can also customize the loader through the culler property:

    Threshold determines how bit an object must be in the screen to stream it.
    maxHiddenTime determines how long an object must be lost to remove it from the scene.
    maxLostTime determines how long an object must be lost to remove it from memory.
  */

  loader.culler.threshold = 10;
  loader.culler.maxHiddenTime = 1000;
  loader.culler.maxLostTime = 3000;


  const model = await loader.load(geometryData, true, propertiesData);
  //console.log(model);
}