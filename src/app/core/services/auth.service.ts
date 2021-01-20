import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private afAuth: AngularFireAuth) { }

  signUpUser(mail, password): Promise<any> {
    return this.afAuth.createUserWithEmailAndPassword(mail, password);
  }

  signInUser(mail, password): Promise<any> {
    return this.afAuth.signInWithEmailAndPassword(mail, password);
  }

  logout() {
    this.afAuth.signOut();
  }

  // isLogged$(): Observable<any> {
  //   return this.afAuth.authState;
  // }

  isLogged(): Promise<any>{
    return this.afAuth.authState.pipe(first()).toPromise();
  }

}
