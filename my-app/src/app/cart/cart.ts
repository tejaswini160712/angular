import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface CartItem {
  name: string;
  qty: number;
  price: number;
}

@Component({
  imports: [CommonModule, FormsModule, RouterLink],
  selector: 'app-cart',
  styleUrl: './cart.css',
  templateUrl: './cart.html',
})
export class Cart {
  private readonly defaultCart: CartItem[] = [
    { name: 'iPhone 15 Pro', qty: 1, price: 999 },
    { name: 'Nike Air Max', qty: 1, price: 159 },
  ];

  cartItems: CartItem[] = this.loadCart();
  showPaymentOptions = false;
  selectedPayment = 'upi';

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
      localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
    }
  }

  increaseQty(index: number): void {
    this.cartItems[index].qty += 1;
    this.saveCart();
  }

  decreaseQty(index: number): void {
    if (this.cartItems[index].qty > 1) {
      this.cartItems[index].qty -= 1;
      this.saveCart();
    }
  }

  removeFromCart(index: number): void {
    this.cartItems.splice(index, 1);
    this.saveCart();
  }

  get subtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  get delivery(): number {
    return this.cartItems.length > 0 ? 25 : 0;
  }

  get total(): number {
    return this.subtotal + this.delivery;
  }

  openPaymentOptions(): void {
    if (this.cartItems.length === 0) {
      window.confirm('Your cart is empty.');
      return;
    }

    this.showPaymentOptions = true;
  }

  completePayment(): void {
    if (this.cartItems.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      `Confirm payment of $${this.total} using ${this.paymentLabel}?`,
    );

    if (!confirmed) {
      return;
    }

    window.alert(`Payment done using ${this.paymentLabel}.`);
    this.cartItems = [];
    this.saveCart();
    this.showPaymentOptions = false;
  }

  get paymentLabel(): string {
    const labels: Record<string, string> = {
      upi: 'UPI',
      card: 'Credit/Debit Card',
      cod: 'Cash on Delivery',
    };

    return labels[this.selectedPayment];
  }
}
