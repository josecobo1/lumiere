import { ToastController } from '@ionic/angular';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { PhotoService } from 'src/app/core/services/photo.service';

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss'],
})
export class UpdateComponent implements OnInit {

  constructor(private fb: FormBuilder, public toastController: ToastController, public photoService: PhotoService) { }

  formGroup: FormGroup;

  ngOnInit() {
    console.log(history.state)
    this.formGroup = this.generateForm();
  }

  generateForm(): FormGroup {
    return this.fb.group({
      name: [history.state.name],
      img: ['']
    });
  }

  onSubmit(){
    console.log(this.formGroup.value);
    this.toast('Profile updated');
  }

  async toast(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }

  addPhotoToGallery() {
    this.photoService.addNewToGallery();
  }
}
