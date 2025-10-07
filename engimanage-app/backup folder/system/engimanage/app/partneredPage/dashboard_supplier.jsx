import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'

const Dashboard_supplier = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analytics Overview</Text>

      <View style={styles.analyticsRow}>
        {/* Total Orders */}
        <View style={styles.card}>
          <Ionicons name="cart-outline" size={28} color="#331177" />
          <Text style={styles.cardValue}>1,245</Text>
          <Text style={styles.cardLabel}>Total Orders</Text>
        </View>

        {/* Revenue */}
        <View style={styles.card}>
          <Ionicons name="cash-outline" size={28} color="#331177" />
          <Text style={styles.cardValue}>₱512,300</Text>
          <Text style={styles.cardLabel}>Total Revenue</Text>
        </View>
      </View>

      <View style={styles.analyticsRow}>
        {/* Products */}
        <View style={styles.card}>
          <Ionicons name="pricetag-outline" size={28} color="#331177" />
          <Text style={styles.cardValue}>320</Text>
          <Text style={styles.cardLabel}>Products</Text>
        </View>

        {/* Customers */}
        <View style={styles.card}>
          <Ionicons name="people-outline" size={28} color="#331177" />
          <Text style={styles.cardValue}>842</Text>
          <Text style={styles.cardLabel}>Customers</Text>
        </View>
      </View>
    </View>
  )
}

export default Dashboard_supplier

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: 'black',
    marginBottom: 15,
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#331177',
    marginTop: 8,
  },
  cardLabel: {
    fontSize: 14,
    color: 'black',
    marginTop: 2,
  },
})
