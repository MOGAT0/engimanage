import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';

const Request = ({
  context = "No message",
  isSender = false,
  isReceiver = false,
  status = "pending",
  onAccept = () => {},
  onReject = () => {},
}) => {
  const showButtons = (isReceiver || isSender) && status === 'pending';

  return (
    <View style={styles.container}>
      <Text style={styles.context}>{context}</Text>

      {showButtons ? (
        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={onAccept} style={[styles.btn, styles.accept]}>
            <Text style={styles.btnText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onReject} style={[styles.btn, styles.reject]}>
            <Text style={styles.btnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={[styles.status, statusStyles[status]]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Text>
      )}
    </View>
  );
};

export default Request;

const statusStyles = {
  pending: { color: 'orange' },
  accepted: { color: 'green' },
  rejected: { color: 'red' },
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 0,
    elevation: 2,
  },
  context: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 10,
  },
  btn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 5,
  },
  accept: {
    backgroundColor: '#28a745',
  },
  reject: {
    backgroundColor: '#dc3545',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
