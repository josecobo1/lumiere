import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private afs: AngularFirestore) { }

  addUser(user): Promise<any> {
    return this.afs.collection('Users').doc(user.id).set(user);
  }

}
