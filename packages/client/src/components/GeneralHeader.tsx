import { AppBar, Box, Toolbar } from '@mui/material';
import styles from '../styles/main.module.css';
import { PageLink } from './PageLink';
import { AdvisorDashboard } from '../pages';
import { WaterlilyHeaderLink } from './WaterlilyHeaderLink';

export function GeneralHeader() {
  return (
    <AppBar
      position="static"
      className={styles.appbar}
    >
      <Toolbar disableGutters>
        <Box>
          <WaterlilyHeaderLink
            topMargin={1}
            toAdvisorDashboard={true}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
