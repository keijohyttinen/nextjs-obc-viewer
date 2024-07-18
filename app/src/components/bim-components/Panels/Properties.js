/* eslint-disable import/no-anonymous-default-export */
import * as BUI from "@thatopen/ui";
import * as CUI from "@thatopen/ui-obc";
import * as OBC from "@thatopen/components";

export default (components) => {
  const html = document.querySelector("html");

  const onThemeChange = (event) => {
    const selector = event.target;
    if (
      selector.value === undefined ||
      selector.value === null ||
      selector.value === 0
    ) {
      html.classList.remove("bim-ui-dark", "bim-ui-light");
    } else if (selector.value === 1) {
      html.className = "bim-ui-dark";
    } else if (selector.value === 2) {
      html.className = "bim-ui-light";
    }
  };

  const [worldsTable] = CUI.tables.worldsConfiguration({ components });

  const onWorldConfigSearch = (e) => {
    const input = e;
    worldsTable.queryString = input.value;
  };

  return BUI.Component.create(() => {
    return BUI.html`
      <bim-panel>
        <bim-panel-section label="Aspect" icon="mage:box-3d-fill">
        </bim-panel-section>
        <bim-panel-section label="Worlds" icon="tabler:world">
          <div style="display: flex; gap: 0.375rem;">
            <bim-text-input @input=${onWorldConfigSearch} vertical placeholder="Search..." debounce="200"></bim-text-input>
            <bim-button style="flex: 0;" @click=${() =>
              (worldsTable.expanded =
                !worldsTable.expanded)} icon="eva:expand-fill"></bim-button>
          </div>
          ${worldsTable}
        </bim-panel-section>
      </bim-panel> 
    `;
  });
};
