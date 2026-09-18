import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface CartItem {
  name: string;
  qty: number;
  price: number;
}

@Component({
  imports: [CommonModule, RouterLink],
  selector: 'app-cart',
  styleUrl: './cart.css',
  templateUrl: './cart.html',
})
export class Cart {
  cartItems: CartItem[] = this.loadCart();

  private loadCart(): CartItem[] {
    if (typeof localStorage === 'undefined') {
      return [
        { name: 'iPhone 15 Pro', qty: 1, price: 999 },
        { name: 'Nike Air Max', qty: 2, price: 159 },
        { name: 'AirPods Max', qty: 1, price: 499 },
        { name: 'Gaming Headset', qty: 1, price: 89 },
      ];
    }

    const saved = localStorage.getItem('cartItems');
    if (!saved) {
      return [
        { name: 'iPhone 15 Pro', qty: 1, price: 999 },
        { name: 'Nike Air Max', qty: 2, price: 159 },
        { name: 'AirPods Max', qty: 1, price: 499 },
        { name: 'Gaming Headset', qty: 1, price: 89 },
      ];
    }

    try {
      return JSON.parse(saved) as CartItem[];
    } catch {
      return [
        { name: 'iPhone 15 Pro', qty: 1, price: 999 },
        { name: 'Nike Air Max', qty: 2, price: 159 },
        { name: 'AirPods Max', qty: 1, price: 499 },
        { name: 'Gaming Headset', qty: 1, price: 89 },
      ];
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
      return;
    }

    this.removeItem(index);
  }

  removeItem(index: number): void {
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
}
