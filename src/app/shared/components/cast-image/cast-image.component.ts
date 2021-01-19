import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-cast-image',
  templateUrl: './cast-image.component.html',
  styleUrls: ['./cast-image.component.scss'],
})
export class CastImageComponent implements OnInit {

  @Input() cast: any;

  constructor() { }

  ngOnInit() {}

}
