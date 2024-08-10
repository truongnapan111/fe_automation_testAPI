import axios from "axios";
import React from "react";
import { DataList } from "../model/flows/flows.model";
import { NodeData } from "../components/FlowEdit/FlowEdit";
import { convertTreeToGraph } from "../components/FlowEdit/FlowEdit";
import {Edge,Node,} from 'react-flow-renderer';
export const fetchFlowById = async (
    flowId: string,
    setOriginalFlowData: React.Dispatch<React.SetStateAction<DataList | null>>,
    setNodes: React.Dispatch<React.SetStateAction<Node<NodeData>[]>>,
    setEdges: React.Dispatch<React.SetStateAction<Edge<any>[]>>
) => {
    try {
      const res = await axios.get(`http://localhost:8080/api/v1/tooltest/listFlows/${flowId}`);
      const flowData = res.data;
      setOriginalFlowData(flowData);
  
      // Kiểm tra dữ liệu nhận được từ API
      console.log("Raw flowData:", flowData);
  
      // Kiểm tra xem flowData có chứa stateJson không
      if (flowData && flowData.stateJson) {
        // Lấy và chuyển đổi flowStateJson thành JSON
        const flowStateJson = JSON.parse(flowData.stateJson);
        console.log("Parsed flowStateJson:", flowStateJson);
  
        // Kiểm tra xem flowStateJson có phải là một đối tượng không
        if (typeof flowStateJson === 'object' && !Array.isArray(flowStateJson)) {
          const { nodes: newNodes, edges: newEdges } = convertTreeToGraph(flowStateJson);
          setNodes(newNodes);
          setEdges(newEdges);
        } else {
          console.error('flowStateJson is not an object');
        }
      } else {
        console.error('flowData does not contain stateJson');
      }
    } catch (error) {
      
      console.error('Error:', error);
    }
};
  