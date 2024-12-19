import { Switch, alpha, styled } from "@mui/material";

const ThemedSwitch = styled(Switch)(({ theme }) => ({
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: '#382377',
    '&:hover': {
      backgroundColor: alpha('#382377', theme.palette.action.hoverOpacity),
    },
  },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: '#382377',
  },
}));

export default ThemedSwitch;