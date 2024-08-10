import React, { useState, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';

import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
} from 'react-flow-renderer';
import { Divider, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import CustomEdge from '../CustomEdge/CustomEdge';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import SaveIcon from '@mui/icons-material/Save';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../../assets/styles/App.css';
import { flow } from '../../model/toolset-functions/toolset-functions.model';
import { DataList, TreeNode } from '../../model/flows/flows.model';
import { fetchDataListTS } from '../../services/apiGET_ListToolSet.service';
import { fetchFlowById } from '../../services/apiGET_ListFlow_ById.service';
import { handleSaveEdit } from '../../services/apiPUT_ListFlow_ById.service'; 
import uuid from 'uuid-random';


export interface NodeData {
  label: string;
  uuid: string,
  toolsetuuid: string,
}
// TREE to Graph
export const convertTreeToGraph = (
  tree: TreeNode,
  nodes: Node<NodeData>[] = [],
  edges: Edge<any>[] = [],
  parentId: string | null = null,
  x: number = 0,
  y: number = 0,
  level: number = 0
) => {
  // Kiểm tra thuộc tính state của tree
  if (!tree.state) {
    console.error('Tree node is missing state:', tree);
    throw new Error('Tree node is missing state');
  }

  const nodeId = `${tree.state}-${uuid()}`; // Generate unique id for each node
  const currentNode: Node<NodeData> = {
    id: nodeId,
    type: 'default',
    data: { label: `${tree.state}`, uuid: tree.uuid, toolsetuuid: tree.toolsetuuid },
    position: { x, y },
  };

  nodes.push(currentNode);

  if (parentId) {
    edges.push({
      id: `edge-${parentId}-${nodeId}`,
      source: parentId,
      target: nodeId,
      type: 'default',
      label: `${tree.weight}`,
      markerEnd: 'url(#arrow)',
    });
  }
  // SET location
  if (tree.children && Array.isArray(tree.children)) {
    const childXOffset = 130; // Horizontal spacing between nodes
    const childYOffset = 110; // Vertical spacing between nodes
    tree.children.forEach((child, index) => {
      convertTreeToGraph(
        child,
        nodes,
        edges,
        nodeId,
        x + (index - (tree.children.length - 1) / 2) * childXOffset,
        y + childYOffset,
        level + 1
      );
    });
  }

  return { nodes, edges };
};

const edgeTypes = {
  custom: CustomEdge,
};

const EditFlow= observer(() => {
  const { flowUuid } = useParams<{ flowUuid: string }>();
  const [nodes, setNodes] = useState<Node<NodeData>[]>([]);
  const [edges, setEdges] = useState<Edge<any>[]>([]);
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
  const [data, setData] = useState<flow[]>([]);
  const [nodeIdMap, setNodeIdMap] = useState<{ [key: string]: number }>({});
  const [open, setOpen] = useState(false);
  const [originalFlowData, setOriginalFlowData] = useState<DataList | null>(null);

// GRAPH to TREE
const convertGraphToTree = (nodes: Node<NodeData>[], edges: Edge<any>[]): TreeNode => {
  const nodeMap: { [key: string]: TreeNode } = {};
// Initialize nodeMap with nodes and default weight 0
  nodes.forEach(node => {
    const findUuid = data.find(i => i.name === node.data.label)?.toolSet.uuid.toString();
    let tsu = node.data.toolsetuuid === "0" ? findUuid : node.data.toolsetuuid;
    // console.log("hahaha", findUuid, tsu, node.data.toolsetuuid);
    const state = node.data.label;
    nodeMap[node.id] = {
      uuid: node.data.uuid || uuid(),
      toolsetuuid: tsu ?? "0", // Only assign tsu if it is not undefined, otherwise use "0"
      state,
      weight: 0,
      isLastSon: false,
      children: []
    };
  });
  // Iterate over edges to establish connections and update weights
  edges.forEach(edge => {
    const sourceNode = nodeMap[edge.source];
    const targetNode = nodeMap[edge.target];
    // console.log("Test", edge.className, targetNode)
    if (sourceNode && targetNode) {
      const label = edge.data?.label as string;
      const weight = edge.label as string;
      // console.log(label, weight);
      // console.log('ts',edge.data.toolsetuuid)
      const edgeWeight = parseFloat(label) || 0;
      const Weight = parseFloat(weight) || 0;
      if (targetNode.weight === 0) {
        if(label === undefined){
          targetNode.weight = Weight;
        }
        else{
          targetNode.weight = edgeWeight;
        }
      }
     
      sourceNode.children.push({ ...targetNode });
    }
  });

  // Find the root node
  const rootNode = nodes.find(node => !edges.some(edge => edge.target === node.id));
  if (!rootNode) throw new Error('Root node not found');
  return nodeMap[rootNode.id];
};

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onConnect = (params: Connection) => {
    if (isDrawingMode) {
      const label = prompt("Enter the weight when connecting:");
      setEdges((eds) =>
        addEdge(
          { ...params, type: 'custom', markerEnd: 'url(#arrow)',data: { label }},
          eds
        )
      );
    }
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      const position = { x: event.clientX - 1000, y: event.clientY - 290 };

      setNodeIdMap((prev) => {
        const currentCount = prev[type] || 0;
        const newId = type ? `${type}-${currentCount + 1}` : `${currentCount + 1}`;
        const newNode: Node<NodeData> = {
          id: newId,
          type,
          position,
          data: { label: type,uuid: uuid(), toolsetuuid: "0" },
        };
        setNodes((nds) => nds.concat(newNode));
        return { ...prev, [type]: currentCount + 1 };
      });
    },
    [nodes]
  );

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    fetchDataListTS().then(setData)
    if (flowUuid) {
      fetchFlowById(flowUuid,setOriginalFlowData,setNodes,setEdges);
    }
  }, [flowUuid]);

  return (
    <ReactFlowProvider>
      <Box className="app">
        <Box className="flow-editor">
        <Box sx={{ display: 'flex', mt: 2, mb: 2, ml: 2 }}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit" href="/">
              HOME
            </Link>
            <Link
              underline="hover"
              color="text.primary"
              href="/"
              aria-current="page"
            >
              Flow List
            </Link>
            <Link
              underline="hover"
              color="text.primary"
              href="/test"
              aria-current="page"
            >
              Edit Flow
            </Link>
          </Breadcrumbs>
        </Box>
          <Box className="toolbar">
            <Button variant="contained" >
              <PlayCircleOutlineIcon className='run' color="action" sx={{cursor:'pointer'}}/>
            </Button>
            
            <Button variant="contained"  onClick={() => setIsDrawingMode((prev) => !prev)}>
              {isDrawingMode ? <ArrowRightAltIcon color="primary"/> : <ArrowRightAltIcon color="action"/>}
            </Button>
            <Button onClick={handleClickOpen} variant="contained" >
              <SaveIcon color="action" className='SaveIcon' />
            </Button>
            <Divider
              orientation="vertical"
              flexItem
              sx={{ mx: 2 }}
            />
            <TextField 
              id="outlined-basic" 
              name='name'
              label="Name Flow" 
              variant="outlined" 
              size='small'
              // value={formData.fl_name}
              // onChange={handleChange} 
            />
            <Box className="toolbar-right">
              <Button className='dataset' href='/' variant="outlined" >
                  DATASET EDITOR
              </Button>
              <Button className='dataset' href='/' variant="outlined">
                  RUNNER
              </Button>
            </Box>
          </Box>
          <Box className="main-content">
            <Box className="sidebar">
              {data.map((node) => (
                <Box
                  key={node.name}
                  className="dndnode"
                  onDragStart={(event) => event.dataTransfer.setData('application/reactflow', node.name)}
                  draggable
                >
                  {node.name}
                </Box>
              ))}
            </Box>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDrop={onDrop}
              onDragOver={onDragOver}
              edgeTypes={edgeTypes}
              fitView
            >
              <MiniMap />
              <Controls />
              <Background />
              <svg>
                  <defs>
                    <marker
                      id="arrow"
                      viewBox="0 0 10 10"
                      refX="10"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#000" />
                    </marker>
                  </defs>
                </svg>
            </ReactFlow>
          </Box>
        </Box>
        {/* CONFIRM SAVE */}
        <Box>
          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Save Flow</DialogTitle>
            <DialogContent>
              <DialogContentText>
                To save this flow, please click SAVE.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button onClick={() => flowUuid && handleSaveEdit(flowUuid,convertGraphToTree,nodes,edges,setOpen)}>Save</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </ReactFlowProvider>
  );
});

export default EditFlow;
