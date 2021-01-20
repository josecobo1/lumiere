import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { ModalSignupComponent } from '../modal-signup/modal-signup.component';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from 'src/app/core/services/auth.service';
import { ModalSigninComponent } from '../modal-signin/modal-signin.component';

@Component({
  selector: 'app-login-signup-modal',
  templateUrl: './login-signup-modal.component.html',
  styleUrls: ['./login-signup-modal.component.scss'],
})
export class LoginSignupModalComponent implements OnInit {

  constructor(public modalController: ModalController, private fb: FormBuilder, private authService: AuthService, public toastController: ToastController) { }

  ngOnInit() {}

  dismiss(){
    this.modalController.dismiss();
  }

  signUpForm(): FormGroup {
    return this.fb.group({
      id: uuidv4(), // Id random
      name: ['', [Validators.required]],
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    })
  }

  logInForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['']
    });
  }

  async login() {
    const modal = await this.modalController.create({
      component: ModalSigninComponent,
      componentProps: {
        form: this.logInForm()
      }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();

    if(!data.dismiss) {
      console.log('log user', data.user);
      this.signIn(data.user);
    }
  }

  async signup(){
    const modal = await this.modalController.create({
      component: ModalSignupComponent,
      componentProps: {
        form: this.signUpForm()
      }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();

    if(!data.dismiss) {
      console.log('nuevo user', data.user);
      this.saveUser(data.user);
    }
    
  }

  async saveUser(user){
    const u = await this.authService.signUpUser(user.email, user.password);

    this.presentToast('User registered correctly, please sign in');
  }

  async presentToast(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 5000
    });
    toast.present();
  }

  async signIn(user) {
    try {
      await this.authService.signInUser(user.email, user.password);
      this.presentToast('User logged correctly');
      this.modalController.dismiss();
    } catch (error) {
      console.log(error);
      this.presentToast(error.message);
    }
    
  }

}
