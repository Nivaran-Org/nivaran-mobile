import React from 'react';
import MapView, { Marker } from 'react-native-maps';

export default function GrievanceMap({ latitude, longitude }: any) {
  return (
    <MapView 
      style={{ flex: 1 }} 
      initialRegion={{ latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
    >
      <Marker coordinate={{ latitude, longitude }} />
    </MapView>
  );
}