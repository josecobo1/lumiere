import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ListsService {

  constructor(private afs: AngularFirestore) { }

  // Lista por id
  getListDetails(id) {
    console.log(id);
    return this.afs.collection('Lists').doc(id).valueChanges();
  }

  // Recupera todas las listas de un usuario
  async getUsersLists(uid): Promise<any> {
    let lists = [];
    const userLists: any =  await this.afs.collection('Users').doc(uid).valueChanges().pipe(first()).toPromise();
    console.log(userLists.lists);
    userLists.lists.map(async l => lists.push(await this.getListDetails(l).pipe(first()).toPromise()));
    // for(let list in userLists.lists) {
    //   console.log(list);
    //   let l = await this.getListDetails(list).pipe(first()).toPromise();
    //   lists.push(l);
    // }

    return lists;
  }

}