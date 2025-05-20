import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Animated, // Ajout de l'import manquant
  ColorValue,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity
} from 'react-native';

type Citation = {
  contenu: string;
  auteur: string;
};

type CitationReponse = {
  content: string;
  author: string;
};

const { width } = Dimensions.get('window');

type CouleurGradient = readonly [ColorValue, ColorValue];

const jeuxDeCouleurs: CouleurGradient[] = [
  ['#FF9A9E', '#FAD0C4'],
  ['#A18CD1', '#FBC2EB'],
  ['#84FAB0', '#8FD3F4'],
  ['#A1C4FD', '#C2E9FB'],
  ['#FFC3A0', '#FFAFBD'],
];

const App = () => {
  const [citation, setCitation] = useState<Citation>({ contenu: '', auteur: '' });
  const [animOpacite] = useState(new Animated.Value(1));
  const [animTranslation] = useState(new Animated.Value(0));
  const [couleurs, setCouleurs] = useState<CouleurGradient>(['#FF9A9E', '#FAD0C4']);

  const chargerCitation = useCallback(async () => {
    try {
      Animated.timing(animOpacite, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const reponse = await axios.get<CitationReponse>('https://api.quotable.io/random?maxLength=100');
      
      setTimeout(() => {
        setCitation({
          contenu: reponse.data.content,
          auteur: reponse.data.author || 'Auteur inconnu',
        });
        const nouvellesCouleurs = jeuxDeCouleurs[Math.floor(Math.random() * jeuxDeCouleurs.length)];
        setCouleurs([...nouvellesCouleurs]);
        
        animTranslation.setValue(-width);
        Animated.parallel([
          Animated.timing(animOpacite, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(animTranslation, {
            toValue: 0,
            duration: 500,
            easing: Easing.out(Easing.exp),
            useNativeDriver: true,
          }),
        ]).start();
      }, 300);
    } catch (erreur) {
      console.error(erreur);
      setCitation({
        contenu: "Impossible de charger une citation. Veuillez réessayer.",
        auteur: "Système",
      });
    }
  }, [animOpacite, animTranslation]);

  useEffect(() => {
    chargerCitation();
  }, [chargerCitation]);

  return (
    <LinearGradient colors={couleurs} style={styles.conteneur}>
      <Animated.View
        style={[
          styles.conteneurCitation,
          { 
            opacity: animOpacite,
            transform: [{ translateX: animTranslation }] 
          }
        ]}
      >
        <Text style={styles.texteCitation}>&quot;{citation.contenu}&quot;</Text>
        <Text style={styles.texteAuteur}>- {citation.auteur}</Text>
      </Animated.View>

      <TouchableOpacity onPress={chargerCitation} style={styles.bouton}>
        <Text style={styles.texteBouton}>Nouvelle citation</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  conteneurCitation: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 25,
    marginBottom: 30,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  texteCitation: {
    fontSize: 22,
    fontStyle: 'italic',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  texteAuteur: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
    color: '#555',
  },
  bouton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  texteBouton: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default App;