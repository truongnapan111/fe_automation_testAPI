import React, { useState, useCallback, DragEvent, useEffect, useRef } from 'react';
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
  useEdgesState,
  useNodesState
} from 'react-flow-renderer';
import CustomEdge from '../CustomEdge/CustomEdge';
import {  handleSave } from '../../services/apiPOST_Flow.service';
import { fetchDataListTS } from '../../services/apiGET_ListToolSet.service';
import { flow } from '../../model/toolset-functions/toolset-functions.model';
import { flowStates } from '../../model/flowStates.model';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import SaveIcon from '@mui/icons-material/Save';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import { Divider, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, IconButton } from '@mui/material';
// import '..styles/App.css';

interface NodeData {
  label: string;
  originalId: string;
}

const initialNodes: Node<NodeData>[] = [];
const initialEdges: Edge<any>[] = [];
const edgeTypes = {
  custom: CustomEdge,
};

const FlowEditor = observer(() => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<flow[]>([]);
  const [messages, setMessages] = useState<string[]>([]);
  const [nodeIdMap, setNodeIdMap] = useState<{ [key: string]: number }>({});
  const [selectedEdge, setSelectedEdge] = useState<Edge<any> | null>(null);
  const [formData, setFormData] = useState<flowStates>({
    name: "",
    userId: "",
    code: "",
    status: "",
    flowStates: [
      {
        parent: "",
        parent_tool_set_uuid:"",
        child: "",
        child_tool_set_uuid:"",
        edgeWeight: ""
      }
    ]
  });

  const updatedFlowStates = edges.map((edge) => {
    const sourceNode = nodes.find((node) => node.id === edge.source);
    const targetNode = nodes.find((node) => node.id === edge.target);
    const sourceToolSet = data.find((toolset) => toolset.name === sourceNode?.data.label);
    const targetToolSet = data.find((toolset) => toolset.name === targetNode?.data.label);

    return {
      parent: sourceNode?.data.originalId || edge.source,
      parent_tool_set_uuid: sourceToolSet?.toolSet.uuid || '',
      child: targetNode?.data.originalId || edge.target,
      child_tool_set_uuid: targetToolSet?.toolSet.uuid || '',
      edgeWeight: edge.data?.label || "",
    };
  });

  const updatedFormData = {
    ...formData,
    flowStates: updatedFlowStates,
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onConnect = (params: Connection) => {
    if (isDrawingMode) {
      const label = prompt("Enter the weight when connecting:");
      setEdges((eds) =>
        addEdge(
          { ...params, type: 'custom', markerEnd: 'url(#arrow)', data: { label } },
          eds
        )
      );
    }
  };

  const onDragOver = (event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      setNodeIdMap((prev) => {
        const currentCount = prev[type] || 0;
        const newId = `${type}-${currentCount + 1}`;
        const newNode: Node<NodeData> = {
          id: newId,
          type,
          position,
          data: { label: type, originalId: type },
        };
        setNodes((nds) => nds.concat(newNode));
        return { ...prev, [type]: currentCount + 1 };
      });
    },
    [setNodes]
  );

  const handleEdgeClick = (event: React.MouseEvent, edge: Edge<any>) => {
    event.stopPropagation();
    setSelectedEdge(edge);
  };

  useEffect(() => {
    fetchDataListTS().then(setData);
    const interval = setInterval(() => fetchDataListTS().then(setData), 5000);
    return () => clearInterval(interval);
  }, []);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.style.display = inputRef.current.style.display === 'block' ? 'none' : 'block';
    }
  };

  return (
    <ReactFlowProvider>
      <Box className="app">
        <Box className="flow-editor">
          <Box sx={{ display: 'flex', mt: 2, mb: 2, ml: 2 }}>
            <Breadcrumbs aria-label="breadcrumb">
              <Link underline="hover" color="inherit" href="/">
                HOME
              </Link>
              <Link underline="hover" color="text.primary" href="/" aria-current="page">
                Flow List
              </Link>
              <Link underline="hover" color="text.primary" href="/editorFlow" aria-current="page">
                Create Flow
              </Link>
            </Breadcrumbs>
          </Box>
          <Box className="toolbar">
            <Button variant="contained">
              <PlayCircleOutlineIcon className='run' color="action"/>
            </Button>
            <Button variant="contained" onClick={() => setIsDrawingMode((prev) => !prev)}>
              {isDrawingMode ? <ArrowRightAltIcon color="primary"/> : <ArrowRightAltIcon color="action"/>}
            </Button>
            <Button variant="contained" onClick={handleClickOpen}>
              <SaveIcon color="action" className='SaveIcon'/>
            </Button>
            <Divider orientation="vertical" flexItem sx={{ mx: 2 }}/>
            <TextField 
              id="outlined-basic" 
              name='name'
              label="Name Flow" 
              variant="outlined" 
              sx={{backgroundColor: '#FFFFFF', borderRadius: '6%' }}
              size='small'
              value={formData.name}
              onChange={handleChange} 
            />
            <Box className="toolbar-right">
              <Button className='dataset' href='/' variant="outlined">
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
            <Box className="canvas">
              <ReactFlow 
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                edgeTypes={edgeTypes}
                onEdgeClick={handleEdgeClick}
                onClick={handleButtonClick}
              >
                <Background />
                <Controls />
                <MiniMap />
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
            <input
              ref={inputRef}
              type="text"
              style={{ display: 'none' }}
            />
          </Box>
        </Box>
      </Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Save Flow</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please fill in the details for the flow.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={() => handleSave(updatedFormData,setOpen)}>Save</Button>
        </DialogActions>
      </Dialog>
    </ReactFlowProvider>
  );
});

export default FlowEditor;
