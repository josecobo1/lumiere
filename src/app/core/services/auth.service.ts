import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private afAuth: AngularFireAuth) { }

  signUpUser(mail, password): Promise<any> {
    return this.afAuth.createUserWithEmailAndPassword(mail, password);
  }

}
