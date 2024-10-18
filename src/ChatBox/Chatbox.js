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
import { RepeatIcon } from '@chakra-ui/icons';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { FaPaperPlane } from 'react-icons/fa';
import ReactTypingEffect from 'react-typing-effect';
import { supabase } from '../supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './ChatBox.css';

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
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(uuidv4());
  const [isAnimating, setIsAnimating] = useState(false);
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
    loadChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatHistory = async () => {
    try {
      const history = await getHistory();
      const formattedHistory = history.flatMap(msg => [
        { sender: 'user', text: msg.user_text, isNew: false },
        { sender: 'bot', text: msg.bot_text, isNew: false }
      ]);
      setMessages(formattedHistory);
    } catch (error) {
      console.error('Error loading chat history:', error);
      toast({
        title: "Error",
        description: "Failed to load chat history. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
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

  const handleClickSpin = async () => {
    setIsAnimating(true);
    
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
        .delete()
        .eq('User', user.id); 
  
      if (error) {
        throw new Error('Error deleting rows: ' + error.message);
      }
  
      console.log('Rows deleted:', data);
      setMessages([]);
      toast({
        title: "Chat history cleared",
        description: "Your chat history has been successfully deleted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error in deleteSupabaseRows:', error);
      toast({
        title: "Error",
        description: "Failed to clear chat history. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setTimeout(() => {
        setIsAnimating(false);
      }, 1000);
    }
  };

  async function getHistory() {
    const { data: { user }, erroruser } = await supabase.auth.getUser()
    console.log(user)
    const { data, error } = await supabase
        .from('chat_history')
        .select('User,bot_text,user_text')
        .eq('User',user.id)

    if (error) {
      throw new Error('Error fetching chat history: ' + error.message);
    }

    return data;
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input, isNew: true };
    setInput('');
    setLoading(true);

    setMessages((prev) => [...prev, userMessage]);

    try {
      const msgHistory = await getHistory();
      const chatSession = model.startChat({
        generationConfig,
        history: msgHistory.flatMap(msg => [
          {
            role: "user",
            parts: [{ text: msg.user_text }]
          },
          {
            role: "model",
            parts: [{ text: msg.bot_text }]
          }
        ]),
      });
      const result = await chatSession.sendMessage(input);
      const botMessageText = result.response.text() || 'I am here to help you!';
      const botMessage = { sender: 'bot', text: botMessageText, isNew: true };

      await saveMessageToSupabase(userMessage.text, botMessage.text);

      setTimeout(() => {
        setMessages((prev) => [...prev, botMessage]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error with Google Generative AI API:', error);
      const errorMessage = { sender: 'bot', text: 'Sorry, something went wrong. Please try again.', isNew: true };
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
                  {msg.sender === 'bot' && msg.isNew ? (
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
            <IconButton
              icon={<RepeatIcon />}
              onClick={handleClickSpin}
              isRound
              aria-label="Reset chat"
              variant="outline"
              colorScheme="pink"
              mr={2}
              size="md"
              _hover={{ bg: 'pink.100' }}
              className={isAnimating ? 'spin-animation' : ''}
              css={{
                '&.spin-animation': {
                  animation: 'spin 1s linear infinite',
                },
                transition: 'all 0.2s',
              }}
            />
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