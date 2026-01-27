import React from 'react';
import { Box, Flex, Text, Button } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const NavBar = ({ onlogOut }) => {
  console.log("NavBar rendered. onLogout type:", typeof onlogOut);

  return (
    <Box
      as="nav"
      bg="linear-gradient(135deg, #FFC0CB, #FFB6C1)"
      backgroundSize="200% 200%"
      animation={`${gradientAnimation} 5s ease infinite`}
      boxShadow="sm"
      p={4}
    >
      <Flex justify="space-between" align="center">
        <Text
          fontSize="2xl"
          fontWeight="bold"
          color="white"
          letterSpacing="wider"
        >
          SafeSpace
        </Text>
        <Button
          colorScheme="pink"
          variant="outline"
          onClick={onlogOut}
          _hover={{ bg: 'pink.100', color: 'pink.800' }}
        >
          Logout
        </Button>
      </Flex>
    </Box>
  );
};

export default NavBar;