new Vue({
  el: '#app',
  data: {
    map: null,
    markers: new Map(),
    searchResults: [],
    searchAddress: '',
    searchHistory: [],
    selectedRecords: [],
    latestSearchTimezone: '',
    latestSearchLocalTime: ''
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
    addMarkersAndRecordSearch() {//////////////////////地图上的pin限制，删除时候移除
      this.searchResults.forEach(result => {
        const marker = new google.maps.Marker({
          position: result.geometry.location,
          map: this.map,
          title: result.formatted_address
        });

        this.markers.push(marker); 

        if (this.searchHistory.length >= 10) {
          const oldestRecord = this.searchHistory.pop();
          this.removeMarker(oldestRecord.id);
        }

        const record = {
          id: Date.now(),
          address: this.searchAddress,
          result: result
        };
        this.searchHistory.unshift(record); 
      });
    },
    removeMarker(id) {
      const markerIndex = this.markers.findIndex(marker => marker.id === id);
      if (markerIndex !== -1) {
        this.markers[markerIndex].setMap(null);
        this.markers.splice(markerIndex, 1);
      }
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
        this.removeMarker(record.id);
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
        this.removeMarker(record.id);
      });
      this.searchHistory = [];
    },
    getTimezone(location) {
      const timestamp = Math.floor(Date.now() / 1000);
      const timeZoneUrl = `https://maps.googleapis.com/maps/api/timezone/json?location=${location.lat()},${location.lng()}&timestamp=${timestamp}&key=AIzaSyBvwwdYP6SsRlx_D8eKzy8C1gZKUWVIICE`;

      // Make an AJAX request to get the time zone
      // You need to replace YOUR_API_KEY with your actual Google Maps API key
      return axios.get(timeZoneUrl)
        .then(response => {
          return response.data.timeZoneId;
        })
        .catch(error => {
          console.error('Error getting time zone:', error);
          return '';
        });
    },
    getLocalTime(timezone) {
      const options = {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        timeZone: timezone
      };

      const localTime = new Date().toLocaleString('en-US', options);
      return localTime;
    }
  }
});
