


// Document https://docs.thatopen.com/Tutorials/Components/Front/IfcStreamer

export async function loadModelByUrl(geometryURL: string, loader: any) {
  
  
  const rawGeometryData = await fetch(geometryURL);
  const geometryData = await rawGeometryData.json();
  let propertiesData;

  const baseUrl = geometryURL.slice(0, geometryURL.lastIndexOf("/") + 1);
  /*if (baseUrl) {
    const propertiesURL = baseUrl + "ifc-processed-properties.json"
    const rawPropertiesData = await fetch(propertiesURL);
    propertiesData = await rawPropertiesData.json();
  }*/

  /*
  You can also customize the loader through the culler property:

    Threshold determines how bit an object must be in the screen to stream it.
    maxHiddenTime determines how long an object must be lost to remove it from the scene.
    maxLostTime determines how long an object must be lost to remove it from memory.
  */


  try{
    const model = await loader.load(geometryData, true, propertiesData);
  }catch(err){
    console.error(err)
  }
  
  //console.log(model);
}