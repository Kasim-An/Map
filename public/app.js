new Vue({
  el: '#app',
  data() {
    return {
      map: null,
      markers: [], // 修改为普通数组
      searchResults: [],
      searchAddress: '',
      searchHistory: [],
      selectedRecords: [],
      latestSearchTimezone: '',
      latestSearchLocalTime: ''
    };
  },
  mounted() {
    this.initMap();
  },
  methods: {
    initMap() {
      this.map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 0, lng: 0 },
        zoom: 12
      });
    },
    getCurrentLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(this.showCurrentLocation);
      } else {
        alert('Geolocation is not supported by this browser.');
      }
    },
    showCurrentLocation(position) {
      const { latitude, longitude } = position.coords;
      const location = new google.maps.LatLng(latitude, longitude);

      this.marker = new google.maps.Marker({
        position: location,
        map: this.map,
        title: 'Your Location'
      });

      this.map.setCenter(location);
    },
    searchAddressOnMap() {
      const geocoder = new google.maps.Geocoder();

      geocoder.geocode({ address: this.searchAddress }, (results, status) => {
        if (status === 'OK') {
          this.clearMarkers();
          this.searchResults = results;
          this.addMarkersAndRecordSearch();

          if (results.length > 0) {
            this.map.setCenter(results[0].geometry.location);
          }
        } else {
          alert('Geocode was not successful for the following reason: ' + status);
        }
      });
    },
    addMarkersAndRecordSearch() {
      this.searchResults.forEach(result => {
        const marker = new google.maps.Marker({
          position: result.geometry.location,
          map: this.map,
          title: result.formatted_address
        });
    
        const record = {
          id: Date.now(),
          address: this.searchAddress,
          result: result,
          marker: marker // 将标记存储在记录中
        };
        this.searchHistory.unshift(record);
    
        if (this.searchHistory.length > 10) {
          const oldestRecord = this.searchHistory.pop();
          oldestRecord.marker.setMap(null); // 移除最旧记录对应的标记
        }
      });
    },
    
    
    
    removeMarker(marker) {
      marker.setMap(null); // 将标记从地图上移除
    },
    
    
    clearMarkers() {
      this.markers.forEach(marker => marker.setMap(null));
      this.markers = [];
    },
    deleteRecord(id) {
      const recordIndex = this.searchHistory.findIndex(record => record.id === id);
      if (recordIndex !== -1) {
        const record = this.searchHistory[recordIndex];
        this.searchHistory.splice(recordIndex, 1);
        this.removeMarker(record.marker); // 移除对应的标记
      }
    },
    deleteSelectedRecords() {
      this.selectedRecords.forEach(id => {
        this.deleteRecord(id);
      });
      this.selectedRecords = [];
    },
    deleteAllRecords() {
      this.searchHistory.forEach(record => {
        this.removeMarker(record.marker); // 移除所有记录对应的标记
      });
      this.searchHistory = [];
    },
  }
});