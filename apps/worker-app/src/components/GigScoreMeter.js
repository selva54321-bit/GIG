import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const GigScoreMeter = ({ score }) => {
  const getTier = (s) => {
    if (s >= 800) return { label: 'Platinum', color: '#B4B4B4' };
    if (s >= 600) return { label: 'Gold', color: '#FFD700' };
    if (s >= 400) return { label: 'Silver', color: '#C0C0C0' };
    return { label: 'Bronze', color: '#CD7F32' };
  };

  const { label, color } = getTier(score);

  return (
    <View style={styles.container}>
      <View style={[styles.circle, { borderColor: color }]}>
        <Text style={styles.scoreText}>{score}</Text>
      </View>
      <Text style={[styles.tierLabel, { color }]}>{label} Tier</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginVertical: 20 },
  circle: {
    width: 150, height: 150, borderRadius: 75,
    borderWidth: 10, justifyContent: 'center', alignItems: 'center'
  },
  scoreText: { fontSize: 36, fontWeight: 'bold' },
  tierLabel: { fontSize: 20, marginTop: 10, fontWeight: '600' }
});

export default GigScoreMeter;
