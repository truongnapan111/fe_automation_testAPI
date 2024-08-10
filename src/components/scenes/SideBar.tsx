import React from 'react';
import styled from 'styled-components';

const SidebarContainer = styled.div`
    width: 200px;
    height: 100%;
    background-color: #f4f4f4;
    padding: 10px;
    box-shadow: 2px 0px 5px rgba(0, 0, 0, 0.1);
`;

const ComponentItem = styled.div`
    padding: 10px;
    margin: 10px 0;
    background-color: #ffffff;
    border: 1px solid #ddd;
    cursor: grab;
    text-align: center;
`;

const Sidebar: React.FC = () => {
    const handleDragStart = (event: React.DragEvent, type: string) => {
        event.dataTransfer.setData('node-type', type);
    };

    return (
        <SidebarContainer>
            <ComponentItem draggable onDragStart={(e) => handleDragStart(e, 'START')}>
                START
            </ComponentItem>
            <ComponentItem draggable onDragStart={(e) => handleDragStart(e, 'STOP')}>
                STOP
            </ComponentItem>
            <ComponentItem draggable onDragStart={(e) => handleDragStart(e, 'SLEEP')}>
                SLEEP
            </ComponentItem>
        </SidebarContainer>
    );
};

export default Sidebar;
