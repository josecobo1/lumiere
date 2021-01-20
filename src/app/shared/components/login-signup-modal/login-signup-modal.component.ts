import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { ModalSignupComponent } from '../modal-signup/modal-signup.component';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-login-signup-modal',
  templateUrl: './login-signup-modal.component.html',
  styleUrls: ['./login-signup-modal.component.scss'],
})
export class LoginSignupModalComponent implements OnInit {

  constructor(public modalController: ModalController, private fb: FormBuilder, private authService: AuthService) { }

  ngOnInit() {}

  dismiss(){
    this.modalController.dismiss();
  }

  buildForm(): FormGroup {
    return this.fb.group({
      id: uuidv4(), // Id random
      name: ['', [Validators.required]],
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    })
  }

  async signup(){
    const modal = await this.modalController.create({
      component: ModalSignupComponent,
      componentProps: {
        form: this.buildForm()
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

    console.log(u);
  }

}
