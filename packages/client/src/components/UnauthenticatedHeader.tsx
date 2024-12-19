import { AppBar, Box, Toolbar } from '@mui/material';
import styles from '../styles/main.module.css';
import './UnauthenticatedHeader.module.css';
import { Link } from 'react-router-dom';
import { WaterlilyHeaderLink } from './WaterlilyHeaderLink';

export function UnauthenticatedHeader() {
  return (
    <AppBar
      position="static"
      className={styles.appbar}
    >
      <Toolbar disableGutters>
        <Box>
          <WaterlilyHeaderLink topMargin={0} />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
