import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const ClaimsScreen = () => {
  const mockClaims = [
    { id: '1', date: 'Mar 15, 2026', trigger: 'Heavy Rain', amount: '450.00', status: 'PAID' },
    { id: '2', date: 'Feb 22, 2026', trigger: 'Poor AQI', amount: '220.50', status: 'PAID' },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.claimItem}>
      <View>
        <Text style={styles.trigger}>{item.trigger}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
      <View style={styles.amountContainer}>
        <Text style={styles.amount}>Rs. {item.amount}</Text>
        <Text style={styles.status}>{item.status}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Auto-Claim History</Text>
      <FlatList
        data={mockClaims}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  claimItem: { 
    backgroundColor: 'white', padding: 15, borderRadius: 10, 
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 
  },
  trigger: { fontSize: 18, fontWeight: 'bold' },
  date: { fontSize: 14, color: '#888' },
  amount: { fontSize: 18, fontWeight: 'bold', color: '#2E7D32', textAlign: 'right' },
  status: { fontSize: 12, color: '#4CAF50', fontWeight: 'bold', textAlign: 'right' }
});

export default ClaimsScreen;
