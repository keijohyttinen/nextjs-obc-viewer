import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as CUI from "@thatopen/ui-obc";
import { AppManager } from "../AppManager";

export default (components) => {
  const fragments = components.get(OBC.FragmentsManager);
  const highlighter = components.get(OBF.Highlighter);
  const appManager = components.get(AppManager);
  const viewportGrid = appManager.grids.get("viewport");

  const [propsTable, updatePropsTable] = CUI.tables.elementProperties({
    components,
    fragmentIdMap: {},
  });
  propsTable.preserveStructureOnFilter = true;
  fragments.onFragmentsDisposed.add(() => updatePropsTable());

  highlighter.events.select.onHighlight.add((fragmentIdMap) => {
    if (!viewportGrid) return;
    viewportGrid.layout = "second";
    propsTable.expanded = false;
    updatePropsTable({ fragmentIdMap });
  });

  highlighter.events.select.onClear.add(() => {
    updatePropsTable({ fragmentIdMap: {} });
    if (!viewportGrid) return;
    viewportGrid.layout = "main";
  });

  const search = (e) => {
    const input = e;
    propsTable.queryString = input.value;
  };

  const toggleExpanded = () => {
    propsTable.expanded = !propsTable.expanded;
  };

  return BUI.Component.create(() => {
    return BUI.html`
      <bim-panel>
        <bim-panel-section name="selection" label="Selection Informatio7n" icon="solar:document-bold" fixed>
          <div style="display: flex; gap: 0.375rem;">
            <bim-text-input @input=${search} vertical placeholder="Search..." debounce="200"></bim-text-input>
            <bim-button style="flex: 0;" @click=${toggleExpanded} icon="eva:expand-fill"></bim-button>
            <bim-button style="flex: 0;" @click=${() =>
              propsTable.downloadData(
                "ElementData",
                "tsv"
              )} icon="ph:export-fill" tooltip-title="Export Data" tooltip-text="Export the shown properties to TSV."></bim-button>
          </div>
          ${propsTable}
        </bim-panel-section>
      </bim-panel> 
    `;
  });
};
