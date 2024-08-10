import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TablePagination,
  Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Breadcrumbs, Link,
  InputBase, Grid
} from '@mui/material';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery, useTheme } from '@mui/material';
import { DataList } from '../../model/flows/flows.model';
import { fetchData } from '../../services/apiGET_ListFlow.service';
import { handleDeleteConfirmed } from '../../services/apiDELETE_Flow.service';

const FlowTable = observer(() => {
  const [data, setData] = useState<DataList[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [openConfirm, setOpenConfirm] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState<string | null>(null);

  const navigate = useNavigate();
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const filteredRows = data.filter(row =>
    (row.name && row.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (row.flowUuid && row.flowUuid.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = (flowUuid: string) => {
    setDeleteRowId(flowUuid);
    setOpenConfirm(true);
  };

  const handleEdit = (flowUuid: string) => {
    navigate(`/editor/editFlow/${flowUuid}`);
  };

  useEffect(() => {
    fetchData(setData);
    const interval = setInterval(() => fetchData(setData), 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', mt: 2, mb: 2, ml: 2 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="/">
            HOME
          </Link>
          <Link underline="hover" color="text.primary" href="/" aria-current="page">
            Flow List
          </Link>
        </Breadcrumbs>
      </Box>
      <Box className='table'>
        <Box sx={{ p: 1.5, width: '100%', mt: 2, flexGrow: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={11}>
              <Paper
                component="form"
                sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: '100%' }}
              >
                <InputBase
                  sx={{ ml: 1, flex: 1 }}
                  placeholder="Search"
                  inputProps={{ 'aria-label': 'search' }}
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
                  <SearchIcon />
                </IconButton>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={1}>
              <Button
                href='/editor/createFlow'
                variant="outlined"
                startIcon={<AddIcon />}
                sx={{ p: '10px', ml: isSmUp ? 1 : 0, mt: isSmUp ? 0 : 1, fontSize: '15px', fontWeight: '600', textAlign: 'center', justifyContent: 'center', width: '100%' }}
              >
                Add
              </Button>
            </Grid>
          </Grid>
        </Box>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>UUID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                <TableRow key={row.flowUuid}>
                  <TableCell>{row.flowUuid}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.createdAt}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleEdit(row.flowUuid)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="primary">
                      <DirectionsRunIcon />
                    </IconButton>
                    <IconButton color="primary">
                      <UpgradeIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(row.flowUuid)} color="primary">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 15]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
      <Dialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this item?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={() => {
            handleDeleteConfirmed(deleteRowId, setData, data);
            setOpenConfirm(false);
          }} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
});

export default FlowTable;
