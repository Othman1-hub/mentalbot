import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Flex,
  Input,
  IconButton,
  Text,
  VStack,
  Container,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { FaPaperPlane } from 'react-icons/fa';
import ReactTypingEffect from 'react-typing-effect';
import { supabase } from '../supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from '@google/generative-ai';

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: '#FFF0F5', 
      },
    },
  },
  colors: {
    pink: {
      50: '#FFF0F5',
      100: '#FFE4E1',
      200: '#FFC0CB',
      300: '#FFB6C1',
      400: '#FF69B4',
      500: '#FF1493',
    },
  },
});

const ChatBox = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your personal mental health assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(uuidv4());
  const messagesEndRef = useRef(null);
  const toast = useToast();

  const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: "You are a mental therapist responding to clients' questions and concerns, offering empathetic support and professional advice.",
  });

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const saveMessageToSupabase = async (userMessage, botMessage) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        throw new Error('Authentication error: ' + authError.message);
      }

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('chat_history')
        .insert([{
          bot_text: botMessage,
          user_text: userMessage,
          User: user.id
        }]);

      if (error) {
        throw new Error('Error saving message: ' + error.message);
      }

      console.log('Message saved:', data);
    } catch (error) {
      console.error('Error in saveMessageToSupabase:', error);
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setInput('');
    setLoading(true);

    setMessages((prev) => [...prev, userMessage]);

    try {
      const chatSession = model.startChat({
        generationConfig,
        history: [],
      });

      const result = await chatSession.sendMessage(input);
      const botMessageText = result.response.text() || 'I am here to help you!';
      const botMessage = { sender: 'bot', text: botMessageText };

      await saveMessageToSupabase(userMessage.text, botMessage.text);

      setTimeout(() => {
        setMessages((prev) => [...prev, botMessage]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error with Google Generative AI API:', error);
      const errorMessage = { sender: 'bot', text: 'Sorry, something went wrong. Please try again.' };
      setMessages((prev) => [...prev, errorMessage]);
      setLoading(false);
      toast({
        title: "Error",
        description: "There was an error processing your message. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <ChakraProvider theme={theme}>
      <Container maxW="container.md" h="calc(100vh - 60px)" py={4}>
        <Box
          bg="white"
          h="100%"
          borderRadius="lg"
          boxShadow="xl"
          display="flex"
          flexDirection="column"
          borderColor="pink.200"
          borderWidth={2}
        >
          <VStack
            flex={1}
            overflowY="auto"
            p={4}
            spacing={4}
            align="stretch"
          >
            {messages.map((msg, index) => (
              <Flex
                key={index}
                justifyContent={msg.sender === 'user' ? 'flex-end' : 'flex-start'}
              >
                <Box
                  maxW="70%"
                  bg={msg.sender === 'user' ? 'pink.400' : 'pink.100'}
                  color={msg.sender === 'user' ? 'white' : 'black'}
                  borderRadius="lg"
                  px={4}
                  py={2}
                >
                  {msg.sender === 'bot' ? (
                    <ReactTypingEffect
                      text={[msg.text]}
                      typingDelay={0}
                      speed={50}
                      eraseDelay={1000000}
                    />
                  ) : (
                    <Text>{msg.text}</Text>
                  )}
                </Box>
              </Flex>
            ))}
            {loading && (
              <Flex justify="flex-start">
                <Spinner size="sm" color="pink.500" />
              </Flex>
            )}
            <div ref={messagesEndRef} />
          </VStack>
          <Flex p={4} borderTop="1px" borderColor="pink.200">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              mr={2}
              focusBorderColor="pink.400"
            />
            <IconButton
              colorScheme="pink"
              aria-label="Send message"
              icon={<FaPaperPlane />}
              onClick={handleSendMessage}
            />
          </Flex>
        </Box>
      </Container>
    </ChakraProvider>
  );
};

export default ChatBox;