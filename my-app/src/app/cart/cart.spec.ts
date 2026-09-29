import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { Cart } from './cart';

describe('Cart', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Cart],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  function createCart() {
    const fixture = TestBed.createComponent(Cart);
    fixture.detectChanges();
    return fixture;
  }

  it('does not show payment options when the cart is empty', () => {
    localStorage.setItem('cartItems', '[]');
    const fixture = createCart();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);

    fixture.componentInstance.openPaymentOptions();
    fixture.detectChanges();

    expect(confirm).toHaveBeenCalledWith('Your cart is empty.');
    expect(fixture.componentInstance.showPaymentOptions).toBe(false);
    expect(fixture.nativeElement.querySelector('.payment-options')).toBeNull();
  });

  it('closes payment options when the last cart item is removed', () => {
    localStorage.setItem('cartItems', JSON.stringify([{ name: 'Phone', qty: 1, price: 999 }]));
    const fixture = createCart();
    const cart = fixture.componentInstance;

    cart.openPaymentOptions();
    expect(cart.showPaymentOptions).toBe(true);

    cart.removeFromCart(0);

    expect(cart.showPaymentOptions).toBe(false);
  });

  it('updates quantity with signals and persists the changes', () => {
    localStorage.setItem('cartItems', JSON.stringify([{ name: 'Phone', qty: 2, price: 999 }]));
    const cart = createCart().componentInstance;

    cart.increaseQty(0);
    expect(cart.cartItems()[0].qty).toBe(3);
    expect(JSON.parse(localStorage.getItem('cartItems')!)[0].qty).toBe(3);

    cart.decreaseQty(0);
    expect(cart.cartItems()[0].qty).toBe(2);
    expect(JSON.parse(localStorage.getItem('cartItems')!)[0].qty).toBe(2);
  });
});