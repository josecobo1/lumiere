import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private afAuth: AngularFireAuth) { }

  // Registrar usuario
  signUpUser(mail, password): Promise<any> {
    return this.afAuth.createUserWithEmailAndPassword(mail, password);
  }

  // Iniciar sesión
  signInUser(mail, password): Promise<any> {
    return this.afAuth.signInWithEmailAndPassword(mail, password);
  }

  // Cerrar sesión
  logout() {
    this.afAuth.signOut();
  }

  // Comprovar si el usuario ha iniciado sesión
  isLogged(): Promise<any>{
    return this.afAuth.authState.pipe(first()).toPromise();
  }

  // Recupera uid del usuario actual
  async getUserId(): Promise<any> {
    const user = await this.afAuth.currentUser;
    return user.uid;
  }

}
