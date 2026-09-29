import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Dashboard],
    }).compileComponents();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  function createDashboard(): Dashboard {
    return TestBed.createComponent(Dashboard).componentInstance;
  }

  it('should create', () => {
    expect(createDashboard()).toBeTruthy();
  });

  it('uses the default cart when there are no saved cart items', () => {
    const component = createDashboard();

    expect(component.cartItems).toEqual([
      { name: 'iPhone 15 Pro', qty: 1, price: 999 },
      { name: 'Nike Air Max', qty: 1, price: 159 },
    ]);
  });

  it('loads cart items saved in local storage', () => {
    const savedItems = [{ name: 'AirPods Max', qty: 2, price: 499 }];
    localStorage.setItem('cartItems', JSON.stringify(savedItems));

    const component = createDashboard();

    expect(component.cartItems).toEqual(savedItems);
  });

  it('returns an empty cart when saved cart data is invalid JSON', () => {
    localStorage.setItem('cartItems', '{invalid json');

    const component = createDashboard();

    expect(component.cartItems).toEqual([]);
  });

  it('smoothly scrolls to the category section', () => {
    const component = createDashboard();
    const scrollIntoView = vi.fn();
    const categorySection = document.createElement('section');
    categorySection.scrollIntoView = scrollIntoView;
    vi.spyOn(document, 'getElementById').mockReturnValue(categorySection);

    component.scrollToCategories();

    expect(document.getElementById).toHaveBeenCalledWith('category-section');
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  it('does nothing when the category section is missing', () => {
    const component = createDashboard();
    vi.spyOn(document, 'getElementById').mockReturnValue(null);

    expect(() => component.scrollToCategories()).not.toThrow();
  });
});
