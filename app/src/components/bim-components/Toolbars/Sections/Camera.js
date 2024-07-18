import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";

export default (world) => {
  const camera = world;

  if (!camera) {
    throw new Error("No camera initialized!");
  }

  const onFitModel = () => {
    if (camera instanceof OBC.OrthoPerspectiveCamera && world.meshes.size > 0) {
      camera.fit(world.meshes, 0.5);
    }
  };

  const onLock = (e) => {
    const button = e;
    camera.enabled = !camera.enabled;
    button.active = !camera.enabled;
    button.label = camera.enabled ? "Disable" : "Enable";
    button.icon = camera.enabled
      ? "tabler:lock-filled"
      : "majesticons:unlock-open";
  };

  const onProjectionDropdownCreated = (e) => {
    if (!(e && camera instanceof OBC.OrthoPerspectiveCamera)) return;
    const dropdown = e
    dropdown.value = [camera.projection.current]
  }

  const onProjectionChange = (e) => {
    if (!(camera instanceof OBC.OrthoPerspectiveCamera)) return
    const dropdown = e
    const value = dropdown.value[0]
    console.log(value)
    camera.projection.set(value)
  }

  return BUI.Component.create(() => {
    return BUI.html`
      <bim-toolbar-section label="Camera" icon="ph:camera-fill" style="pointer-events: auto">
        <bim-button label="Fit Model" icon="material-symbols:fit-screen-rounded" @click=${onFitModel}></bim-button>
        <bim-button label="Disable" icon="tabler:lock-filled" @click=${onLock} .active=${!camera.enabled}></bim-button>
        <!-- <bim-dropdown required>
          <bim-option label="Perspective"></bim-option>
          <bim-option label="Orthographic"></bim-option>
        </bim-dropdown> -->
      </bim-toolbar-section>
    `;
  });
};