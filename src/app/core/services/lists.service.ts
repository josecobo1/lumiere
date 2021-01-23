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

  // Crea una lista en la base de datos
  createNewList(list): Promise<any> {
    this.afs.collection('Lists').doc(list.id).set(list);
    return list.id;
  }

  // Devuelve un array con los detalles de lista de un usuario
  async getDetailedLists(uid): Promise<any> {
    const lists = await this.getUserLists(uid);

    const detailedLists = await Promise.all(lists.map(async (l) =>{
      return await this.getListDetails(l).pipe(first()).toPromise();
    } ));

    return detailedLists;
  }

}