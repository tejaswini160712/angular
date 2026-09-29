import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

interface CartItem {
  name: string;
  qty: number;
  price: number;
}

interface RazorpayOrder {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
}

interface RazorpayPayment {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (payment: RazorpayPayment) => void;
  modal: { ondismiss: () => void };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => { open: () => void };
  }
}

@Component({
  imports: [CommonModule, FormsModule, RouterLink],
  selector: 'app-cart',
  styleUrl: './cart.css',
  templateUrl: './cart.html',
})
export class Cart {
  private readonly http = inject(HttpClient);
  private readonly defaultCart: CartItem[] = [
    { name: 'iPhone 15 Pro', qty: 1, price: 999 },
    { name: 'Nike Air Max', qty: 1, price: 159 },
  ];

  cartItems = signal<CartItem[]>(this.loadCart());
  showPaymentOptions = false;
  paymentStatus: 'idle' | 'processing' | 'success' | 'error' = 'idle';
  paymentMessage = '';

  private loadCart(): CartItem[] {
    const saved = localStorage.getItem('cartItems');
    if (!saved) {
      return [...this.defaultCart];
    }

    try {
      return JSON.parse(saved) as CartItem[];
    } catch {
      return [];
    }
  }

  private saveCart(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('cartItems', JSON.stringify(this.cartItems()));
    }
  }

  increaseQty(index: number): void {
    this.cartItems.update((items) =>
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, qty: item.qty + 1 } : item,
      ),
    );
    this.saveCart();
  }

  decreaseQty(index: number): void {
    if (!this.cartItems()[index] || this.cartItems()[index].qty <= 1) {
      return;
    }

    this.cartItems.update((items) =>
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, qty: item.qty - 1 } : item,
      ),
    );
    this.saveCart();
  }

  removeFromCart(index: number): void {
    this.cartItems.update((items) => items.filter((_, itemIndex) => itemIndex !== index));
    if (this.cartItems().length === 0) {
      this.showPaymentOptions = false;
    }
    this.saveCart();
  }

  get subtotal(): number {
    return this.cartItems().reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  get delivery(): number {
    return this.cartItems().length > 0 ? 25 : 0;
  }

  get total(): number {
    return this.subtotal + this.delivery;
  }

  openPaymentOptions(): void {
    if (this.cartItems().length === 0) {
      window.confirm('Your cart is empty.');
      return;
    }

    this.showPaymentOptions = true;
  }

  async completePayment(): Promise<void> {
    if (this.cartItems().length === 0) {
      return;
    }

    this.paymentStatus = 'processing';
    this.paymentMessage = 'Connecting to Razorpay...';

    try {
      const order = await firstValueFrom(
        this.http.post<RazorpayOrder>('http://localhost:3000/api/payments/orders', {
          items: this.cartItems().map(({ name, qty }) => ({ name, qty })),
        }),
      );

      if (!(await this.loadRazorpayCheckout()) || !window.Razorpay) {
        throw new Error('Razorpay Checkout could not be loaded.');
      }

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'My Shopping',
        description: 'Shopping cart payment',
        order_id: order.orderId,
        handler: (payment) => void this.verifyPayment(payment),
        modal: {
          ondismiss: () => {
            if (this.paymentStatus === 'processing') {
              this.paymentStatus = 'idle';
              this.paymentMessage = '';
            }
          },
        },
      });
      checkout.open();
    } catch (error) {
      this.paymentStatus = 'error';
      this.paymentMessage = error instanceof Error ? error.message : 'Unable to start payment.';
    }
  }

  private loadRazorpayCheckout(): Promise<boolean> {
    if (window.Razorpay) {
      return Promise.resolve(true);
    }

    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  private async verifyPayment(payment: RazorpayPayment): Promise<void> {
    this.paymentMessage = 'Verifying payment...';

    try {
      await firstValueFrom(
        this.http.post('http://localhost:3000/api/payments/verify', {
          orderId: payment.razorpay_order_id,
          paymentId: payment.razorpay_payment_id,
          signature: payment.razorpay_signature,
        }),
      );
      this.cartItems.set([]);
      this.saveCart();
      this.showPaymentOptions = false;
      this.paymentStatus = 'success';
      this.paymentMessage = 'Payment successful. Your order is confirmed.';
    } catch {
      this.paymentStatus = 'error';
      this.paymentMessage = 'Payment could not be verified. Contact support before trying again.';
    }
  }
}
