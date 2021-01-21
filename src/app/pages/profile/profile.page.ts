import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { LoginSignupModalComponent } from 'src/app/shared/components/login-signup-modal/login-signup-modal.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  constructor(public modalController: ModalController, public authService: AuthService, public toastController: ToastController) { }

  async ngOnInit() {
    const state = await this.authService.isLogged();

    if(state == null){
      console.timeLog('no session');
      this.presentModal();
    }
  }

  async presentModal(){
    const modal = await this.modalController.create({
      component: LoginSignupModalComponent,
    });

    return await modal.present();
  }

  logout(){
    this.authService.logout();
    this.presentToast('Session ended');
  }

  async presentToast(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 5000
    });
    toast.present();
  }

  async isLogged() {
    console.log('boton clickado');
    const state = await this.authService.isLogged();
    if(state){
      this.presentToast('User logged');
    } else {
      this.presentToast('User not logged in the app');
    }
  }

}
