import React, { useState, useEffect, Fragment, useSelector } from "react";
import PropTypes from "prop-types";
import Box from "@material-ui/core/Box";
import clsx from "clsx";
import { lighten, makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import Toolbar from "@material-ui/core/Toolbar";
import Checkbox from "@material-ui/core/Checkbox";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import DeleteIcon from "@material-ui/icons/Delete";
import FilterListIcon from "@material-ui/icons/FilterList";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import SearchIcon from "@material-ui/icons/Search";
import TableFooter from "@material-ui/core/TableFooter";
import Button from "@material-ui/core/Button";
import FirstPageIcon from "@material-ui/icons/FirstPage";
import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";
import LastPageIcon from "@material-ui/icons/LastPage";
import { MenuItem, Input, FormHelperText } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import {
  getManufacturers,
  addManufacturer,
  deleteManufacturer,
  changeManufacturer,
} from "../../actions/manufacturers";
import Select from "react-select";
import countryList from "react-select-country-list";
import { connect } from "react-redux";
import Grid from "@material-ui/core/Grid";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";

import InputLabel from "@material-ui/core/InputLabel";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "date-fns";
import { format } from "date-fns";
import DateFnsUtils from "@date-io/date-fns";
import Snackbar from "@material-ui/core/Snackbar";

import EditIcon from "@material-ui/icons/Edit";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import MuiAlert from "@material-ui/lab/Alert";
import drugsubclasses from "../../reducers/drugsubclasses";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  {
    id: "title",
    numeric: false,
    disablePadding: true,
    label: "Title",
  },
  {
    id: "country",
    numeric: false,
    disablePadding: false,
    label: "Country",
  },

  { id: "owner", numeric: false, disablePadding: false, label: "Created By" },
  { id: "actions", numeric: false, disablePadding: false, label: "Actions" },
];

function EnhancedTableHead(props) {
  const {
    classes,
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
  } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ "aria-label": "select all systems" }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "default"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  highlight:
    theme.palette.type === "light"
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  title: {
    flex: "1 1 100%",
  },
}));

const EnhancedTableToolbar = (props) => {
  const classes = useToolbarStyles();
  const { numSelected } = props;

  return (
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      {numSelected > 0 ? (
        <Typography
          className={classes.title}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          className={classes.title}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          Manufacturers
        </Typography>
      )}

      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton aria-label="delete">
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton aria-label="filter list">
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    alignContent: "center",
  },
  paper: {
    width: "100%",
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 20,
    width: 1,
  },
  paper: {
    margin: theme.spacing(2),
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },

  option: {
    fontSize: 15,
    "& > span": {
      marginRight: 10,
      fontSize: 18,
    },
  },
}));

const DrugClasses = (props) => {
  const classes = useStyles();
  const [search, setSearch] = useState("");
  const [rows, setRows] = React.useState([]);
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("title");
  const [selected, setSelected] = React.useState([]);
  const [countries, setCountries] = useState(countryList().getData());
  const [reload, setReload] = useState();

  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [isSubmitionCompleted, setSubmitionCompleted] = useState(false);
  const [creatingManufacturer, setCreatingManufacturer] = useState(false);
  const [selectedManufacturer, setSelectedManufacturer] = useState({});
  const [editManufacturer, setEditingManufacturer] = useState(false);

  useEffect(() => {
    props.getManufacturers();
  }, []);

  console.log("countries", countries);

  useEffect(() => {
    setRows(props.manufacturers);
  }, [props.manufacturers]);

  useEffect(() => {
    props.getManufacturers();
    console.log("please update");
    setEditingManufacturer(false);
    setCreatingManufacturer(false);
  }, [props.update]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  const onSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleCreateNewManufacturer = () => {
    setSubmitionCompleted(false);
    setCreatingManufacturer(true);
  };

  //Edit generic

  const handleDeleteUser = (user_id) => {
    console.log(user_id);
    props.deleteManufacturer(user_id);
  };

  //Close modals
  const handleClose = () => {
    setCreatingManufacturer(false);
    setEditingManufacturer(false);
  };

  const handleEditManufacturer = (generic) => {
    console.log("Edit system", generic);
    setEditingManufacturer(true);
    setSelectedManufacturer(generic);
  };

  //Cancel editing generic
  const handleCancelEdit = () => {
    setEditingManufacturer(false);
  };

  const handleCountryValues = (setFieldValue, val) => {
    const { value } = val;
    console.log("country", value);
    setFieldValue("country", value);
  };

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <EnhancedTableToolbar numSelected={selected.length} />
        <TableContainer>
          <Paper className={classes.root}>
            <Table dense table size="small">
              <TableBody>
                <TableRow>
                  <TableCell align="left">
                    <TextField
                      color="primary"
                      placeholder="Search"
                      value={search}
                      onChange={onSearchChange}
                      className={classes.search}
                      id="input-search"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleCreateNewManufacturer}
                    >
                      Add new
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>

          <Fragment>
            <Dialog
              open={creatingManufacturer}
              onClose={handleClose}
              aria-labelledby="form-dialog-title"
            >
              {creatingManufacturer && (
                <Fragment>
                  <DialogTitle id="form-dialog-title">
                    Create new manufacturer
                  </DialogTitle>

                  <DialogContent>
                    <DialogContentText>
                      Enter manufacturer details:
                    </DialogContentText>

                    <Formik
                      initialValues={{
                        title: "",
                        country: "",
                      }}
                      onSubmit={(values, { setSubmitting }) => {
                        setSubmitting(false);
                        console.log("drug class to save", values);

                        props.addManufacturer(values);
                        // setSubmitionCompleted(props.submissionSuccessful);
                        // setOpenErrorSnackBar(true);
                      }}
                      validationSchema={Yup.object().shape({
                        title: Yup.string().required("Title is required"),
                        country: Yup.string().required("Country is required"),
                      })}
                    >
                      {(props) => {
                        const {
                          values,
                          setFieldValue,
                          touched,
                          errors,
                          dirty,
                          isSubmitting,
                          handleChange,
                          handleBlur,
                          handleSubmit,
                          handleReset,
                        } = props;
                        return (
                          <form onSubmit={handleSubmit}>
                            <div>
                              <TextField
                                fullWidth
                                margin="normal"
                                variant="outlined"
                                error={errors.title && touched.title}
                                multiline
                                type="textarea"
                                label="Description"
                                name="title"
                                type="title"
                                className={classes.textField}
                                value={values.title}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                helperText={
                                  errors.title && touched.title && errors.title
                                }
                              />

                              <Box my={2}>
                                <Autocomplete
                                  fullWidth
                                  margin="medium"
                                  variant="outlined"
                                  id="countries-select"
                                  // defaultValue={{
                                  //   title:
                                  //     selectedPreparation.formulation_details
                                  //       .title,
                                  //   id: values.formulation,
                                  // }}
                                  options={countries}
                                  onChange={(e, val) =>
                                    handleCountryValues(setFieldValue, val)
                                  }
                                  // autoHighlight
                                  // selectOnFocus

                                  getOptionLabel={(option) => option.label}
                                  renderOption={(option) => (
                                    <React.Fragment>
                                      {option.label}
                                    </React.Fragment>
                                  )}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label="Choose Country"
                                      variant="outlined"
                                      inputProps={{
                                        ...params.inputProps,
                                        name: "country",
                                        // autoComplete: "new-password", // disable autocomplete and autofill
                                      }}
                                    />
                                  )}
                                />
                              </Box>

                              <DialogActions>
                                <Button
                                  type="button"
                                  className="outline"
                                  onClick={handleReset}
                                  disabled={!dirty || isSubmitting}
                                >
                                  Reset
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                  Submit
                                </Button>
                                {/* <DisplayFormikState {...props} /> */}
                              </DialogActions>
                            </div>
                          </form>
                        );
                      }}
                    </Formik>
                  </DialogContent>
                </Fragment>
              )}
            </Dialog>

            {/* Editing generic */}
            <Dialog
              open={editManufacturer}
              onClose={handleClose}
              aria-labelledby="form-dialog-title"
            >
              {editManufacturer && (
                <React.Fragment>
                  <DialogTitle id="form-dialog-title">Edit generic</DialogTitle>
                  <DialogContent>
                    <DialogContentText>Change details</DialogContentText>
                    <Formik
                      initialValues={{
                        title: selectedManufacturer.title,
                      }}
                      onSubmit={(values, { setSubmitting }) => {
                        console.log("at submit for edit", values);
                        props.changeManufacturer(
                          values,

                          selectedManufacturer.id
                        );
                      }}
                      validationSchema={Yup.object().shape({
                        title: Yup.string().required("Title is required"),
                      })}
                    >
                      {(props) => {
                        const {
                          values,
                          setFieldValue,
                          touched,
                          errors,
                          dirty,
                          isSubmitting,
                          handleChange,
                          handleBlur,
                          handleSubmit,
                          handleReset,
                        } = props;
                        return (
                          <form onSubmit={handleSubmit}>
                            <div>
                              <TextField
                                fullWidth
                                error={errors.title && touched.title}
                                multiline
                                type="textarea"
                                label="Description"
                                name="title"
                                type="title"
                                className={classes.textField}
                                value={values.title}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                helperText={
                                  errors.title && touched.title && errors.title
                                }
                                margin="normal"
                              />

                              <DialogActions>
                                <Button
                                  type="button"
                                  className="outline"
                                  onClick={handleReset}
                                  disabled={!dirty || isSubmitting}
                                >
                                  Reset
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                  Submit
                                </Button>
                                {/* <DisplayFormikState {...props} /> */}
                              </DialogActions>
                            </div>
                          </form>
                        );
                      }}
                    </Formik>
                  </DialogContent>
                </React.Fragment>
              )}
            </Dialog>
          </Fragment>

          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size={dense ? "small" : "medium"}
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={classes}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .filter((row) => !search || row.title.includes(search))
                .map((row, index) => {
                  const isItemSelected = isSelected(row.id);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          //Moved this funtionality to checkbox intead of entire row
                          onClick={(event) => handleClick(event, row.id)}
                          role="checkbox"
                          aria-checked={isItemSelected}
                          tabIndex={-1}
                          key={row.id}
                          selected={isItemSelected}
                          checked={isItemSelected}
                          inputProps={{ "aria-labelledby": labelId }}
                        />
                      </TableCell>
                      <TableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        padding="none"
                      >
                        {row.title}
                      </TableCell>
                      <TableCell align="left">{row.country}</TableCell>
                      <TableCell>
                        <IconButton
                          aria-label="delete"
                          size="small"
                          color="secondary"
                          onClick={() => handleDeleteUser(row.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                        <IconButton
                          aria-label="edit"
                          size="small"
                          color="primary"
                          onClick={() => handleEditManufacturer(row)}
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
      <FormControlLabel
        control={<Switch checked={dense} onChange={handleChangeDense} />}
        label="Dense padding"
      />
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    manufacturers: state.manufacturers.manufacturers,
    update: state.manufacturers.update,
  };
};

export default connect(mapStateToProps, {
  getManufacturers,
  addManufacturer,
  deleteManufacturer,
  changeManufacturer,
})(DrugClasses);
