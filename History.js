import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supabase } from './supabaseClient';
import * as Device from 'expo-device';
import moment from 'moment';
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      fetchHistory(); // Fetch history every time the screen is focused
    }, [])
  );

  const fetchHistory = async () => {
    setLoading(true); // Start loading while fetching
    const deviceID = `${Device.deviceName}-${Device.osBuildId}`; // Generate unique device ID

    try {
      const { data: historyData, error: historyError } = await supabase
        .from('library')
        .select('*')
        .eq('device_id', deviceID); // Fetch history based on device ID

      if (historyError) {
        console.error('Error fetching history:', historyError);
      } else {
        setHistory(historyData || []); // If no history, set an empty array
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false); // Stop loading once the fetch is complete
    }
  };

  const clearHistory = async () => {
    const deviceID = `${Device.deviceName}-${Device.osBuildId}`; // Generate unique device ID

    try {
      const { error: deleteError } = await supabase
        .from('library')
        .delete()
        .eq('device_id', deviceID); // Delete all rows related to device ID

      if (deleteError) {
        console.error('Error clearing history:', deleteError);
      } else {
        setHistory([]); // Clear local history state
      }
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  if (loading) {
    return <Text>Loading...</Text>; // Show loading message
  }

  if (history.length === 0) {
    return (
      <LinearGradient
      colors={['#5e16ec', '#121212']}
      style={styles.viewContainer}
    >
      <View style={styles.container}>
        <Text style={styles.title}>You have no history</Text>
      </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#5e16ec', '#121212']}
      style={styles.viewContainer}
    >
      <ScrollView style={styles.container}>
        {history.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.historyItem}
            onPress={() => navigation.navigate('Final', { songId: item.id })} // Navigate to Final.js with the song ID
          >
            {item.album_art_url ? (
              <Image source={{ uri: item.album_art_url }} style={styles.albumArt} />
            ) : (
              <View style={styles.placeholderImage} /> // Placeholder if no image URL
            )}
            <View style={styles.detailsContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.artist}>{item.artiste}</Text>
              <Text style={styles.timestamp}>
                {moment(item.created_at).format('MMMM Do YYYY, h:mm:ss a')}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.clearButton}
          onPress={clearHistory}
        >
          <Text style={styles.clearButtonText}>Clear History</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
    padding: 10,

  },
  historyItem: {
    flexDirection: 'row',
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#575d9d',
    borderRadius: 10,
    elevation: 1,
  },
  albumArt: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ccc', // Placeholder color
  },
  detailsContainer: {
    marginLeft: 10,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    maxWidth: '90%'
  },
  artist: {
    fontSize: 14,
    maxWidth: '90%'
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
  },
  clearButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default History;
