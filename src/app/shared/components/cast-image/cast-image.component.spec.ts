import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CastImageComponent } from './cast-image.component';

describe('CastImageComponent', () => {
  let component: CastImageComponent;
  let fixture: ComponentFixture<CastImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CastImageComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CastImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
