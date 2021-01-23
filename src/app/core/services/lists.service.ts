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

  // Lista por id
  getListDetails(id): Observable<any> {
    console.log(id);
    return this.afs.collection('Lists').doc(id).valueChanges();
  }

  async getUserLists(uid) {
    const user = await this.user.getUser(uid).pipe(first()).toPromise();
    return user.lists;
  }

}