import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";

// Use this to access any global information
export class AppManager extends OBC.Component {
  static uuid = "939bb2bc-7d31-4a44-811d-68e4dd286c35";
  enabled = true;
  grids = new Map();
}
