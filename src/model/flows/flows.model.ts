import { FLOW_STATUS } from "../../constant/flows.constant";

export interface TreeNode {
  uuid: string;
  toolsetuuid: string;
  state: string;
  weight: number;
  isLastSon: boolean;
  children: TreeNode[];
}
export interface DataList {
    readonly flowUuid: string;
    readonly name: string;
    readonly userId: Number;
    readonly status: FLOW_STATUS;
    readonly code: string;
    readonly stateJson: TreeNode[];
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly deleted: string;
  }
  