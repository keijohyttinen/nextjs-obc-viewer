import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as BUI from "@thatopen/ui";
import customSelections from "../../Tables/CustomSelections";

export default (components) => {
  const [customSelectionsTable, updateCustomSelections] = customSelections({
    components,
  });
  const highlighter = components.get(OBF.Highlighter);

  let newSelectionForm;
  let groupNameInput;
  let saveSelectionBtn;

  const onFormCreated = (e) => {
    if (!e) return;
    newSelectionForm = e;
    highlighter.events.select.onClear.add(() => {
      newSelectionForm.style.display = "none";
    });
  };

  const onGroupNameInputCreated = (e) => {
    if (!e) return;
    groupNameInput = e;
    highlighter.events.select.onClear.add(() => {
      groupNameInput.value = "";
    });
  };

  const onSaveSelectionCreated = (e) => {
    if (!e) return;
    saveSelectionBtn = e;
    highlighter.events.select.onHighlight.add(() => {
      saveSelectionBtn.style.display = "block";
    });
    highlighter.events.select.onClear.add(() => {
      saveSelectionBtn.style.display = "none";
    });
  };

  const onSaveGroupSelection = async () => {
    if (!(groupNameInput && groupNameInput.value.trim() !== "")) return;
    newSelectionForm.style.display = "none";
    saveSelectionBtn.style.display = "none";
    const classifier = components.get(OBC.Classifier);
    classifier.list.CustomSelections[groupNameInput.value] =
      highlighter.selection.select;
    updateCustomSelections();
    groupNameInput.value = "";
  };

  const onNewSelection = () => {
    const selectionLength = Object.keys(highlighter.selection.select).length;
    if (!(newSelectionForm && selectionLength !== 0)) return;
    newSelectionForm.style.display = "flex";
  };

  const onCancelGroupCreation = () => {
    if (!newSelectionForm) return;
    newSelectionForm.style.display = "none";
    groupNameInput.value = "";
  };

  return BUI.Component.create(() => {
    return BUI.html`
      <bim-panel-section label="Custom Selections" icon="clarity:blocks-group-solid">
        <div ${BUI.ref(onFormCreated)} style="display: none; gap: 0.5rem">
          <bim-text-input ${BUI.ref(
            onGroupNameInputCreated
          )} placeholder="Selection Name..." vertical></bim-text-input>
          <bim-button @click=${onSaveGroupSelection} icon="mingcute:check-fill" style="flex: 0" label="Accept"></bim-button>
          <bim-button @click=${onCancelGroupCreation} icon="mingcute:close-fill" style="flex: 0" label="Cancel"></bim-button>
        </div>
        ${customSelectionsTable}
        <bim-button style="display: none;" ${BUI.ref(
          onSaveSelectionCreated
        )} @click=${onNewSelection} label="Save Selection"></bim-button>
      </bim-panel-section>
    `;
  });
};
