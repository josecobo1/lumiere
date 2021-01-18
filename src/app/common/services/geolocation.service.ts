import { Injectable } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  constructor(private geolocation: Geolocation) {}

  getCurrentLocation() {
    this.geolocation.getCurrentPosition().then((data) => {
      console.log(data);
      return data;
    }).catch((error) => {
      console.log('error', error);
      return error;
    });
  }
  
}
