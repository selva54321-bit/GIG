import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import GigScoreMeter from '../components/GigScoreMeter';

const HomeScreen = () => {
  const mockUser = {
    name: "Ramesh Kumar",
    score: 850,
    coverage: "ACTIVE",
    premium: 19
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Namaste, {mockUser.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: '#4CAF50' }]}>
          <Text style={styles.statusText}>COVERING YOU</Text>
        </View>
      </View>

      <GigScoreMeter score={mockUser.score} />

      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>This Week's Outlook</Text>
        <Text style={styles.cardDetail}>Premium: Rs. {mockUser.premium}</Text>
        <Text style={styles.cardDetail}>GigCorpus Savings: Rs. {(mockUser.premium * 0.3).toFixed(2)}</Text>
      </View>

      <View style={styles.corpusCard}>
        <Text style={styles.corpusTitle}>GigCorpus Projection</Text>
        <Text style={styles.corpusAmount}>Rs. 1,420.50</Text>
        <Text style={styles.corpusDesc}>Projected Return after 12 months</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  welcome: { fontSize: 22, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15 },
  statusText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  infoCard: { backgroundColor: 'white', padding: 20, borderRadius: 10, marginTop: 20, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  cardDetail: { fontSize: 16, color: '#666' },
  corpusCard: { backgroundColor: '#1A237E', padding: 20, borderRadius: 10, marginTop: 15 },
  corpusTitle: { color: '#C5CAE9', fontSize: 14 },
  corpusAmount: { color: 'white', fontSize: 28, fontWeight: 'bold' },
  corpusDesc: { color: '#E8EAF6', fontSize: 12, marginTop: 5 }
});

export default HomeScreen;
