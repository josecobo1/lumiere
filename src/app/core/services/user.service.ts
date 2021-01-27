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

  // Comprueba si una película està marcada como vista por un usuario
  async isSeen(userUid, movieId) {

    // Recupero la información del usuario
    const user = await this.getUser(userUid).pipe(first()).toPromise();

    // Busco en el array si la película aparece como vista
    const seen = user.seen.some(m => m.movie == movieId);

    return seen;
  }

  // Comprueba si una película està guardada por un usuario
  async isSaved(userUid, movieId){
    const user = await this.getUser(userUid).pipe(first()).toPromise();
    const saved = user.saved.some(m => m.movie == movieId);
    console.log('service is saved:', saved)
    return saved;
  }

  // Añade id de una película a la lista de películas vistas
  async addMovieToSeen(userUid, movieId) {

    // Recupero toda la info del usuario en Firestore
    const user = await this.getUser(userUid).pipe(first()).toPromise();

    console.log(user);
    // Busco en al array de peliculas si alguna contien el mismo id => devuelve true o false
    const duplicated = user.seen.some(m => m.movie == movieId);
    
    
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

  // Elimina películas de la lista de películas vistas
  async removeMovieFromSeen(userUid, movieId): Promise<any> {

    // Recupero la información del usuario
    const user = await this.getUser(userUid).pipe(first()).toPromise();
    
    // Busco el indice de la película en el array de películas vistas
    const findIndex = user.seen.findIndex(m => m.movie == movieId);

    // Elimino la película del array usando el indice
    user.seen.splice(findIndex, 1);

    // Guardo los cambios en Firestore
    this.afs.collection('Users').doc(userUid).set(user);

  }

  // Añade ide de una película a la lista de películas guardadas para ver mas tarde
  async addMovieToSeeLater(userUid, movieId) {

    // Recupero información del usuario en Firestore
    const user = await this.getUser(userUid).pipe(first()).toPromise();

    const duplicated = user.saved.some(m => m.movie == movieId);

    if(duplicated) {
      return false;
    } else {
      // Añado el id de la película a la lista de películas por ver
      user.saved.push({
        movie: movieId
      });

      // Guardo los cambios en Firestore
      this.afs.collection('Users').doc(userUid).set(user);

      return true;
    }

  }

  // Elimina película de ls lista de películas guardadas
  async removeMovieFromSeeLater(userUid, movieId) {
    const user = await this.getUser(userUid).pipe(first()).toPromise();
    const findIndex = user.saved.findIndex(m => m.movie == movieId);
    user.saved.splice(findIndex, 1);
    this.afs.collection('Users').doc(userUid).set(user);
  }

  // Añade una lista al usuario
  async addListToUser(userId, listId) {
    const user = await this.getUser(userId).pipe(first()).toPromise();
    console.log(user.lists);
    const duplicated = user.lists.some(m => m == listId);
    console.log(`Duplicated: ${duplicated}`);
    if(duplicated) {
      return false;
    } else {
      user.lists.push(listId);
      console.log(user);
      this.afs.collection('Users').doc(user.id).set(user);
      return true;
    }
  }

  // Seguir - dejar de seguir una lista
  async followUnfollowList(userId, collectionId): Promise<any> {
    console.log('parametros', userId, collectionId);
    let user = await this.getUser(userId).pipe(first()).toPromise();
    console.log(user);
    const duplicated = user.lists.some(l => l == collectionId);
    if(duplicated){
      const index = user.lists.findIndex(l => l == collectionId);
      user.lists.splice(index, 1);
      this.afs.collection('Users').doc(userId).set(user);
      return false;
    } else {
      user.lists.push(collectionId);
      this.afs.collection('Users').doc(userId).set(user);
      return true;
    }
  }

}
