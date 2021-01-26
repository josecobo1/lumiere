import { Component, Input, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';
import { ListsService } from 'src/app/core/services/lists.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss'],
})
export class CollectionComponent implements OnInit {

  @Input() collection: any;
  movies: any;
  isLogged: boolean = false;
  userId: any;
  isOwner: boolean;
  isFollowing: boolean;
  user: any;

  constructor(public listsService: ListsService, public authService: AuthService, public userService: UserService) { }

  slideOpts = {
    slidesPerView: 3.5,
    spaceBetween: 50
  }

  async ngOnInit() {
    try {
      await this.getMoviesFromList();
      await this.isUserLogged();
      this.isUserOwner();
      if(!this.isOwner) {
        await this.getUserFromFirebase();
        this.isUserFollowing();
      }
    } catch (error) {
      console.log('error');
    } finally {}
     
  }

  async getMoviesFromList() {
    this.movies = await this.listsService.getMoviesFromList(this.collection.id);
  }

  async followUnfollow(id) {
    if(this.isLogged){
      const result = await this.userService.followUnfollowList(this.userId, this.collection.id);
      result ? console.log('Following') : console.log('Unfollowing');
      await this.getUserFromFirebase();
      this.isUserFollowing();
    } else {
      alert('no session');
    }
  }

  async isUserLogged() {
    const result = await this.authService.isLogged();
    if(result){
      this.isLogged = true;
      this.userId = await this.authService.getUserId();
    } else {
      this.isLogged = false;
    }
  }

  async isUserOwner() {
    (this.collection.owner == this.userId) ? this.isOwner = true : this.isOwner = false;
  }

  async getUserFromFirebase(){
    this.user = await this.userService.getUser(this.userId).pipe(first()).toPromise();
  }

  isUserFollowing() {
    const following = this.user.lists.some(l => l == this.collection.id);
    following ? this.isFollowing = true : this.isFollowing = false;
  }

}
