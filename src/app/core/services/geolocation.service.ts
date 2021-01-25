import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  googleMapsAPIUrl = environment.googleMapsAPI.API_URL;
  googleMapsAPIKey = environment.googleMapsAPI.API_KEY;

  location: string;

  constructor(private geolocation: Geolocation, private http: HttpClient) {}

  // Con la API de Google Maps transformo las coordenadas en una dirección 'entendible' y sacar el país
  // https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyBEmSCHtCzxIlAtzGSRhLt951oSuQpr-Pc&latlng=41.726709299999996,1.8246753
  getHumanReadableLocation$(coordinates): Observable<any> {
    return this.http.get<any>(`${this.googleMapsAPIUrl}?key=${this.googleMapsAPIKey}&latlng=${coordinates.latitude},${coordinates.longitude}`);
  }

  // Captura la ubicación gps del usuario e identifica el país
  async getCurrentLocation() {
    console.log('current position');
    try {
      console.log('bloque try');
      let data = await this.geolocation.getCurrentPosition(); // Captura posición gps
      console.log('data', data);
      let position = await this.getHumanReadableLocation$(data.coords).pipe().toPromise(); // Transforma la ubicación gps en información leible
      console.log('position', position);
      let region = position.results[0].address_components[5].short_name; // Guardo el codigo de país
      console.log('region', region);
      return region;
    } catch (error) {
      throw error;
    }
    
  }
  
}
