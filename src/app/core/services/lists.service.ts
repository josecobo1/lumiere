import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class ListsService {

  constructor(private afs: AngularFirestore, private user: UserService) { }

  // Recupera toda la info del usuario con el service User
  async getUserLists(uid) {
    const user = await this.user.getUser(uid).pipe(first()).toPromise();
    return user.lists;
  }

  // Lista por id
  getListDetails(id): Observable<any> {
    console.log(id);
    return this.afs.collection('Lists').doc(id).valueChanges();
  }

  // Añade una película a una lista
  async addMovieToList(movieId, listId) {
    const list = await this.getListDetails(listId).pipe(first()).toPromise();

    const duplicated = list.movies.some(m => m == movieId);

    if(duplicated) {
      return false;
    } else {
      list.movies.push(movieId);
      this.afs.collection('Lists').doc(listId).set(list);
      return true;
    }
  }


}