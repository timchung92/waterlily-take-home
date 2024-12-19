import * as React from 'react';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import { makeStyles } from '@mui/material';

export default function LinearDeterminate() {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          return 0;
        }
        const diff = Math.random() * 10;
        return Math.min(oldProgress + diff, 100);
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <span style ={{width: '20rem'}}>
      <LinearProgress sx={{
         backgroundColor: '#F5F5F5',
         '& .MuiLinearProgress-barColorPrimary' : {
            backgroundColor: '#3D1C7C'
      },
      }} variant="determinate" value={progress} />
      </span>
  );
}