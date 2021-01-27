import { HttpClient } from '@angular/common/http';
import { areAllEquivalent } from '@angular/compiler/src/output/output_ast';
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

  async getCurrentLocation() {
    try {
      const gps = await this.geolocation.getCurrentPosition();
      console.log('gps:', gps);

      let adress = await this.getHumanReadableLocation$(gps.coords).pipe().toPromise();
      console.log('adress', adress);

      const country = adress.results.filter(a => {return a.types.includes('country')});
      return country[0].address_components[0].short_name

    } catch (error) {
      console.log('error', error);
    }
  }
}
