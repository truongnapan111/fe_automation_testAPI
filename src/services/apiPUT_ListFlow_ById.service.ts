import axios from "axios";
import { Edge, Node } from 'react-flow-renderer';
import { NodeData} from "../components/FlowEdit/FlowEdit";
import { TreeNode } from "../model/flows/flows.model";
import React from "react";

export const handleSaveEdit = async (
  flowUuid: string,
  convertGraphToTree: (nodes: Node[], edges: Edge[]) => TreeNode,
  nodes: Node<NodeData>[],
  edges: Edge<any>[],
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (!flowUuid) {
    console.error('FlowUuid is undefined');
    return;
  }
  try {
    const rootNode = convertGraphToTree(nodes, edges);
    console.log(rootNode);
    
    const updatedFlowData = {
      ...rootNode
    };
    console.log(updatedFlowData);

    const res = await axios.put(`http://localhost:8080/api/v1/tooltest/updateFlowState/${flowUuid}`, updatedFlowData);
    console.log("Data saved successfully:", res.data);
    setOpen(false); // setOpen không được định nghĩa trong hàm này, nếu cần, bạn có thể chuyển trạng thái ở nơi khác
  } catch (error) {
    console.log("Error saving data:", error);
  }
};
