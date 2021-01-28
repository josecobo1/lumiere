import { UserService } from 'src/app/core/services/user.service';
import { ToastController } from '@ionic/angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { PhotoService } from 'src/app/core/services/photo.service';

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss'],
})
export class UpdateComponent implements OnInit {

  constructor(private fb: FormBuilder, 
              public toastController: ToastController, 
              public photoService: PhotoService,
              public userService: UserService) { }

  formGroup: FormGroup;

  ngOnInit() {
    console.log(history.state)
    this.formGroup = this.generateForm();
  }

  generateForm(): FormGroup {
    return this.fb.group({
      name: [history.state.name, [Validators.required]],
      slugline: [history.state.slugline, [Validators.required]]
    });
  }

  async onSubmit(){
    console.log(this.formGroup.value);
    await this.userService.updateUser({ ...history.state, ...this.formGroup.value});
    await this.toast('Profile updated');
  }

  async toast(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }

  async addPhotoToGallery() {
    await this.photoService.addNewToGallery();
    this.toast('Profile image updated!');
  }
}
