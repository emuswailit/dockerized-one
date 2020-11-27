import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import Drawer from "@material-ui/core/Drawer";
import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Collapse from "@material-ui/core/Collapse";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import ShowChartIcon from "@material-ui/icons/ShowChart";
import history from "../history";
import { Link, Redirect } from "react-router-dom";
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

const ListItems = ({ items, visible, onClick }) => (
  <Collapse in={visible}>
    {items
      .filter(({ hidden }) => !hidden)
      .map(({ label, disabled, Icon }, i) => (
        <ListItem button key={i} disabled={disabled} onClick={onClick(label)}>
          <ListItemIcon>
            <Icon />
          </ListItemIcon>
          <ListItemText>{label}</ListItemText>
        </ListItem>
      ))}
  </Collapse>
);
export default function ButtonAppBar(props) {
  console.log("props", props);
  const classes = useStyles();

  console.log("history", history);
  const [open, setOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [content, setContent] = useState("Home");
  const [items] = useState({
    ADMIN: [
      { label: "Users", Icon: AddIcon },
      { label: "Remove CPU", Icon: RemoveIcon },
      { label: "Usage", Icon: ShowChartIcon },
    ],
    CLIENTS: [
      { label: "Add Memory", Icon: AddIcon },
      { label: "Usage", Icon: ShowChartIcon },
    ],
    PHARMACISTS: [
      { label: "Add Storage", Icon: AddIcon },
      { label: "Usage", Icon: ShowChartIcon },
    ],
    PRESCRIBERS: [
      { label: "Add Network", Icon: AddIcon, disabled: true },
      { label: "Usage", Icon: ShowChartIcon },
    ],
  });
  const [sections, setSections] = useState({
    ADMIN: true,
    CLIENTS: false,
    PHARMACISTS: false,
    PRESCRIBERS: false,
  });

  const onClick = (content) => () => {
    console.log("omaria", content);
    setOpen(false);
    setContent(content);
    if (content === "Users") {
      console.log("content here: ", content);
      // history.push("/users");
      <Link to="/users" />;
    }
  };
  const toggleDrawer = () => {
    setOpen(!open);
  };

  const toggleSection = (name) => () => {
    setSections({ ...sections, [name]: !sections[name] });
  };

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            {content}
          </Typography>
          {props.auth.isAuthenticated ? (
            <Button color="inherit" onClick={() => props.logout()}>
              Logout
            </Button>
          ) : null}
        </Toolbar>
      </AppBar>

      <Grid item>
        <Drawer open={open} onClose={() => setOpen(false)}>
          <List>
            <ListSubheader>
              <Button
                disableRipple
                classes={{ root: classes.listSubheader }}
                onClick={toggleSection("ADMIN")}
              >
                ADMIN
              </Button>
            </ListSubheader>
            <ListItems
              visible={sections.ADMIN}
              items={items.ADMIN}
              onClick={onClick}
            />
            <ListSubheader>
              <Button
                disableRipple
                classes={{ root: classes.listSubheader }}
                onClick={toggleSection("CLIENTS")}
              >
                CLIENTS
              </Button>
            </ListSubheader>
            <ListItems
              visible={sections.CLIENTS}
              items={items.CLIENTS}
              onClick={onClick}
            />
            <ListSubheader>
              <Button
                disableRipple
                classes={{ root: classes.listSubheader }}
                onClick={toggleSection("PHARMACISTS")}
              >
                PHARMACISTS
              </Button>
            </ListSubheader>
            <ListItems
              visible={sections.PHARMACISTS}
              items={items.PHARMACISTS}
              onClick={onClick}
            />
            <ListSubheader>
              <Button
                disableRipple
                classes={{ root: classes.listSubheader }}
                onClick={toggleSection("PRESCRIBERS")}
              >
                PRESCRIBERS
              </Button>
            </ListSubheader>
            <ListItems
              visible={sections.PRESCRIBERS}
              items={items.PRESCRIBERS}
              onClick={onClick}
            />
          </List>
        </Drawer>
      </Grid>
    </div>
  );
}
