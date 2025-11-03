
import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  styles: {
    global: {
      'html, body': {
        backgroundColor: 'gray.900',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
      },
    },
  },
  colors: {
    primary: {
      500: '#38B2AC', 
    },
  },
});

export default theme;
