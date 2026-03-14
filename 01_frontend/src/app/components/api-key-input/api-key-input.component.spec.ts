import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApiKeyInputComponent } from './api-key-input.component';

describe('api-key-input', () => {
  let component: ApiKeyInputComponent;
  let fixture: ComponentFixture<ApiKeyInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApiKeyInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ApiKeyInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
