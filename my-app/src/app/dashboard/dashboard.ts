import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  oldPrice: number;
  rating: number;
  emoji: string;
  badge: string;
}

@Component({
  imports: [CommonModule],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  constructor(private router: Router) {}

  categories = ['All', 'Smartphones', 'Audio', 'Sports', 'Accessories'];
  selectedCategory = 'All';

  products: Product[] = [
    { id: 1, name: 'iPhone 15 Pro', category: 'Smartphones', price: 999, oldPrice: 1199, rating: 4.8, emoji: '📱', badge: 'Top Pick' },
    { id: 2, name: 'AirPods Max', category: 'Audio', price: 499, oldPrice: 599, rating: 4.7, emoji: '🎧', badge: 'Best Deal' },
    { id: 3, name: 'Nike Air Max', category: 'Sports', price: 159, oldPrice: 229, rating: 4.6, emoji: '👟', badge: 'New' },
    { id: 4, name: 'Gaming Headset', category: 'Accessories', price: 89, oldPrice: 129, rating: 4.5, emoji: '🎮', badge: 'Hot' },
    { id: 5, name: 'Samsung Galaxy S24', category: 'Smartphones', price: 879, oldPrice: 999, rating: 4.9, emoji: '📲', badge: 'Popular' },
    { id: 6, name: 'Bluetooth Speaker', category: 'Audio', price: 119, oldPrice: 169, rating: 4.4, emoji: '🔊', badge: 'Trending' },
  ];

  cartItems = [
    { name: 'iPhone 15 Pro', qty: 1, price: 999 },
    { name: 'Nike Air Max', qty: 1, price: 159 },
  ];

  get filteredProducts(): Product[] {
    if (this.selectedCategory === 'All') {
      return this.products;
    }

    return this.products.filter((product) => product.category === this.selectedCategory);
  }

  setCategory(category: string): void {
    this.selectedCategory = category;
  }

  addToCart(product: Product): void {
    const existingItem = this.cartItems.find((item) => item.name === product.name);

    if (existingItem) {
      existingItem.qty += 1;
      return;
    }

    this.cartItems.push({ name: product.name, qty: 1, price: product.price });
  }

  increaseQty(index: number): void {
    this.cartItems[index].qty += 1;
  }

  decreaseQty(index: number): void {
    if (this.cartItems[index].qty > 1) {
      this.cartItems[index].qty -= 1;
    }
  }

  get subtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  get delivery(): number {
    return this.subtotal > 0 ? 25 : 0;
  }

  get total(): number {
    return this.subtotal + this.delivery;
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }
}
