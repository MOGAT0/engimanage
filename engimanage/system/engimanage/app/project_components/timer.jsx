import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Counter = ({
  start = false,
  initialTime = 0,
  countDown = false,
  interval = 1000,
}) => {
  const [time, setTime] = useState(initialTime);

  useEffect(() => {
    let timer;

    if (start) {
      setTime(initialTime);
      timer = setInterval(() => {
        setTime(prevTime => countDown ? Math.max(0, prevTime - 1) : prevTime + 1);
      }, interval);
    }

    return () => clearInterval(timer);
  }, [start, initialTime, interval, countDown]);

  const formatTime = (seconds) => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timeText}>{formatTime(Math.floor(time))}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#331177',
    letterSpacing: 2,
  },
});

export default Counter;