import { TextField, styled } from '@mui/material';

export const CustomizedTextInput = styled(TextField)({
  '& .MuiInput-underline:after': {
    borderBottomColor: '#B2BAC2',
  },
  '& .MuiOutlinedInput-root': {
    '&.fieldset': {
      border: '1px solid #000000',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#3d1c7c',
      border: '2px solid #3d1c7c',
    },
  },
});
