import { MoviesService } from 'src/app/core/services/movies.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { from, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';
import { ListsService } from 'src/app/core/services/lists.service';
import { UserService } from 'src/app/core/services/user.service';
import { LoginSignupModalComponent } from 'src/app/shared/components/login-signup-modal/login-signup-modal.component';
import { ModalMovieDetailsComponent } from 'src/app/shared/components/modal-movie-details/modal-movie-details.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  seen;
  saved;
  user;
  lists;
  subscribe: Subscription;

  selector: string = 'seen';

  constructor(public modalController: ModalController, 
              public authService: AuthService, 
              public toastController: ToastController,
              public userService: UserService,
              public listsService: ListsService,
              public router: Router,
              public loadinController: LoadingController,
              public moviesService: MoviesService) { }

  async ngOnInit() {

    const state = await this.authService.isLogged();

    if(state == null){
      console.timeLog('no session');
      this.presentModal();
    } else {
      try {
        const loading = await this.loadinController.create({
          message: 'Loading',
          translucent: true
        });

        await loading.present();

        await this.getUserData();

        loading.dismiss();
        
      } catch (error) {
        console.log('Some error ocurred');
      }
      
    }
  }

  async getModal(movie) {

    const images = await this.moviesService.getMovieImages(movie.id).pipe().toPromise();
    
    const modal = await this.modalController.create({
      component: ModalMovieDetailsComponent,
      componentProps: {
        movie: movie,
        images: images
      }
    });
    return await modal.present();
  }

  async getUserData() {
    const uid = await this.authService.getUserId();
    this.subscribe = this.userService.getUser(uid).subscribe(data => this.user = data);
    console.log(this.user);
  }

  async presentModal(){
    const modal = await this.modalController.create({
      component: LoginSignupModalComponent
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

  async segmentChanged(event) {
    if(event.detail.value === 'collections') {
      this.lists = await this.listsService.getDetailedLists(this.user.id);
      this.selector = event.detail.value;
    } else {
      this.selector = event.detail.value;
    }
    
  }

  getDetails(list) {
    this.router.navigate(['tabs/profile/lists/details'], {state: list})
  }

}
