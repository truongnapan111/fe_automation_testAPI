
import React from 'react';
import {Routes, Route} from 'react-router-dom'
import FlowTable from './components/FlowTable/FlowTable';
import NavBar from './components/scenes/NavBar';
import FlowEditor from './components/FlowEditor/FlowEditor'
import Test from './components/FlowEdit/FlowEdit'
import { observer } from 'mobx-react-lite';
const App= observer(()=>{
  return (
    <div className="App">
      <NavBar />
      <Routes>
        <Route path='/' element={<FlowTable />} />
        <Route path='/editor/createFlow' element={<FlowEditor />} />
        <Route path='/editor/editFlow/:flowUuid' element={<Test />} />
   
      </Routes>
    </div>
    
  );
}) 
  



export default App;
