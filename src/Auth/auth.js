import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  useToast,
  VStack,
  useColorModeValue,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import ReactTypingEffect from 'react-typing-effect';
import { keyframes } from '@emotion/react';
import { useNavigate } from 'react-router-dom';

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const AuthForm = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate(); 

  const formBgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const inputBgColor = useColorModeValue('gray.100', 'gray.700');
  const buttonBgColor = useColorModeValue('teal.500', 'teal.300');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isSignUp && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      toast({
        title: 'Error.',
        description: 'Passwords do not match.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              first_name: formData.firstName,
              last_name: formData.lastName,
            },
          },
        });
        if (error) throw error;

        toast({
          title: 'Signed up successfully!',
          description: "We've created your account. Please check your email for confirmation.",
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        setIsSignUp(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;

        
        if (data && data.session) {
          onLogin(data.session.access_token);
          navigate('/'); 
        }

        toast({
          title: 'Signed in successfully.',
          description: 'Welcome back!',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (err) {
      setError(err.message);
      toast({
        title: 'Error.',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      bgGradient="linear(to-r, #ff9d9d, #F99dbc,#758d93 )"
      animation={`${gradientAnimation} 15s ease infinite`}
      backgroundSize="200% 200%"
    >
      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} minH="100vh" gap={0}>
        <GridItem
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={8}
        >
          <VStack spacing={6} align="center">
            <Heading as="h1" size="2xl" color="white" textAlign="center">
              SafeSpace
            </Heading>
            <Text fontSize="lg" color="white" textAlign="center">
              <ReactTypingEffect
                text={[
                  'Your AI Mental Therapist.',
                  'Here to Listen and Support.',
                  'Helping You Find Peace of Mind.'
                ]}
                speed={80}
                eraseSpeed={60}
                typingDelay={1000}
                eraseDelay={2000}
              />
            </Text>
          </VStack>
        </GridItem>

        <GridItem display="flex" alignItems="center" justifyContent="center">
          <Box
            maxW="400px"
            p={8}
            borderWidth={1}
            borderRadius="lg"
            bg={formBgColor}
            shadow="lg"
          >
            <VStack spacing={6}>
              <Heading as="h2" size="lg" color={textColor} textAlign="center">
                {isSignUp ? 'Create Your Account' : 'Sign In to Your Account'}
              </Heading>
              {error && <Text color="red.400">{error}</Text>}

              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <VStack spacing={4}>
                  {isSignUp && (
                    <>
                      <FormControl id="firstName">
                        <FormLabel color={textColor}>First Name</FormLabel>
                        <Input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          required={isSignUp}
                          bg={inputBgColor}
                          color={textColor}
                          _placeholder={{ color: 'gray.400' }}
                        />
                      </FormControl>
                      <FormControl id="lastName">
                        <FormLabel color={textColor}>Last Name</FormLabel>
                        <Input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          required={isSignUp}
                          bg={inputBgColor}
                          color={textColor}
                          _placeholder={{ color: 'gray.400' }}
                        />
                      </FormControl>
                    </>
                  )}
                  <FormControl id="email">
                    <FormLabel color={textColor}>Email</FormLabel>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      bg={inputBgColor}
                      color={textColor}
                      _placeholder={{ color: 'gray.400' }}
                    />
                  </FormControl>
                  <FormControl id="password">
                    <FormLabel color={textColor}>Password</FormLabel>
                    <Input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      bg={inputBgColor}
                      color={textColor}
                      _placeholder={{ color: 'gray.400' }}
                    />
                  </FormControl>
                  {isSignUp && (
                    <FormControl id="confirmPassword">
                      <FormLabel color={textColor}>Confirm Password</FormLabel>
                      <Input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required={isSignUp}
                        bg={inputBgColor}
                        color={textColor}
                        _placeholder={{ color: 'gray.400' }}
                      />
                    </FormControl>
                  )}
                  <Button
                    type="submit"
                    isLoading={loading}
                    loadingText={isSignUp ? 'Signing Up' : 'Signing In'}
                    colorScheme="teal"
                    bg={buttonBgColor}
                    color="white"
                    width="100%"
                    _hover={{
                      bg: buttonBgColor,
                      opacity: 0.8,
                    }}
                  >
                    {isSignUp ? 'Sign Up' : 'Sign In'}
                  </Button>
                  <Text color={textColor} fontSize="sm">
                    {isSignUp ? 'Already have an account?' : 'Dont have an account?'}
                    <Button
                      onClick={() => setIsSignUp(!isSignUp)}
                      variant="link"
                      color="teal.500"
                    >
                      {isSignUp ? 'Sign In' : 'Sign Up'}
                    </Button>
                  </Text>
                </VStack>
              </form>
            </VStack>
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default AuthForm;
