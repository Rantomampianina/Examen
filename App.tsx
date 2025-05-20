import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity
} from 'react-native';

type Quote = {
  content: string;
  author: string;
};

type QuoteResponse = {
  content: string;
  author: string;
};

const { width } = Dimensions.get('window');

const colorSets = [
  ['#FF9A9E', '#FAD0C4'],
  ['#A18CD1', '#FBC2EB'],
  ['#84FAB0', '#8FD3F4'],
  ['#A1C4FD', '#C2E9FB'],
  ['#FFC3A0', '#FFAFBD'],
] as const;

const App = () => {
  const [quote, setQuote] = useState<Quote>({ content: '', author: '' });
  const [fadeAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(0));
  const [colors, setColors] = useState<[string, string]>(['#FF9A9E', '#FAD0C4']);

  const fetchQuote = useCallback(async () => {
    try {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const response = await axios.get<QuoteResponse>('https://api.quotable.io/random');
      
      setTimeout(() => {
        setQuote({
          content: response.data.content,
          author: response.data.author,
        });
        setColors([...colorSets[Math.floor(Math.random() * colorSets.length)]] as [string, string]);
        
        slideAnim.setValue(-width);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 500,
            easing: Easing.out(Easing.exp),
            useNativeDriver: true,
          }),
        ]).start();
      }, 300);
    } catch (error) {
      console.error(error);
      setQuote({
        content: "Failed to load quote",
        author: "System",
      });
    }
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  return (
    <LinearGradient colors={colors} style={styles.container}>
      <Animated.View
        style={[
          styles.quoteContainer,
          { 
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }] 
          }
        ]}
      >
        <Text style={styles.quoteText}>&quot;{quote.content}&quot;</Text>
        <Text style={styles.authorText}>- {quote.author}</Text>
      </Animated.View>

      <TouchableOpacity onPress={fetchQuote} style={styles.button}>
        <Text style={styles.buttonText}>New Quote</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  quoteContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 25,
    marginBottom: 30,
    width: '90%',
  },
  quoteText: {
    fontSize: 22,
    fontStyle: 'italic',
    marginBottom: 15,
    textAlign: 'center',
  },
  authorText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 30,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default App;