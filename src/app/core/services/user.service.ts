import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as dayjs from 'dayjs';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private afs: AngularFirestore, private auth: AuthService) { }

  // Guardo objeto User en firestore
  addUser(user): Promise<any> {
    return this.afs.collection('Users').doc(user.id).set(user);
  }

  // Recupera info del usuario por su uid
  getUser(uid): Observable<any> {
    return this.afs.collection('Users').doc(uid).valueChanges();
  }

  // Añade id de una película a la lista de películas vistas
  async addMovieToSeen(userUid, movieId) {

    // Recupero toda la info del usuario en Firestore
    const user = await this.getUser(userUid).pipe(first()).toPromise();

    console.log(user);

    const duplicated = user.seen.some(m => m.movie == movieId);
    console.log(duplicated);
    if(duplicated) {
      return false; // Devuelvo false como resultado de la operación ya que la película ya està guardada como vista
    } else {
      // En la lista de películas vistas añado el id de la nueva película
      user.seen.push({
        movie: movieId
      });

      // Guardo los cambios en Firestore
      this.afs.collection('Users').doc(userUid).set(user);

      return true; // Devuelve true como resultado, la película se ha añadido al array de películas vistas
    }

  }

  // Añade ide de una película a la lista de películas guardadas para ver mas tarde
  async addMovieToSeeLater(userUid, movieId) {

    // Recupero información del usuario en Firestore
    const user = await this.getUser(userUid).pipe(first()).toPromise();

    // Añado el id de la película a la lista de películas por ver
    user.saved.push({
      movie: movieId
    });

    // Guardo los cambios en Firestore
    return this.afs.collection('Users').doc(userUid).set(user);
  }

}
