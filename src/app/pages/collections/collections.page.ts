import { Component, OnInit } from '@angular/core';
import { ListsService } from 'src/app/core/services/lists.service';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.page.html',
  styleUrls: ['./collections.page.scss'],
})
export class CollectionsPage implements OnInit {

  search: string;

  constructor(public listsService: ListsService) { }

  collections: Array<any>;

  ngOnInit() {
  }

  async getCollections(event){
    this.collections = await this.listsService.searchLists(event.target.value);
    console.log(this.collections);
  }

}
