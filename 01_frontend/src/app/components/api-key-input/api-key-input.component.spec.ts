import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApiKeyInputComponent } from './api-key-input.component';
import { AuthService } from '../../auth.service';
import { ERROR_MESSAGE } from '../../constants';
import { By } from '@angular/platform-browser';

describe('api-key-input', () => {
  let component: ApiKeyInputComponent;
  let fixture: ComponentFixture<ApiKeyInputComponent>;
  let authServiceMock: { setKey: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authServiceMock = { setKey: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ApiKeyInputComponent],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(ApiKeyInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('Data validation', () => {
    it('should show error if entered API key is empty (spaces)', () => {
      const el: HTMLElement = fixture.nativeElement;
      const input = el.querySelector('input') as HTMLInputElement;
      const button = el.querySelector('button') as HTMLButtonElement;

      input.value = '   ';
      input.dispatchEvent(new Event('input'));
      button.click();
      fixture.detectChanges();

      expect(component.errorMessage).toBe(ERROR_MESSAGE.API_KEY_IS_EMPTY);
      expect(authServiceMock.setKey).not.toHaveBeenCalled();

      const errorDiv = el.querySelector('[data-testid="api-key-error"]');
      expect(errorDiv?.textContent).toContain(ERROR_MESSAGE.API_KEY_IS_EMPTY);
    });
  });
});
