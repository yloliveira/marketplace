import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storedProducts = await AsyncStorage.getItem('@goMarketPlace/cart');
      if (storedProducts && JSON.parse(storedProducts).length) {
        setProducts(JSON.parse(storedProducts));
      }
    }

    loadProducts();
  }, []);

  const storeNewProducts = useCallback(async newProducts => {
    setProducts([...newProducts]);
    await AsyncStorage.setItem(
      '@goMarketPlace/cart',
      JSON.stringify(newProducts),
    );
  }, []);

  const addToCart = useCallback(async product => {
    const productIndex = products.findIndex(({ id }) => id === product.id);
    let newProducts = products;
    if (productIndex >= 0) {
      newProducts[productIndex].quantity += 1;
    } else {
      newProducts.push({ ...product, quantity: 1 });
    }
    await storeNewProducts(newProducts);
  }, []);

  const increment = useCallback(async id => {
    const productIndex = products.findIndex(product => product.id === id);
    let newProducts = products;
    if (productIndex >= 0) {
      newProducts[productIndex].quantity += 1;
      await storeNewProducts(newProducts);
    }
  }, []);

  const decrement = useCallback(async id => {
    const productIndex = products.findIndex(product => product.id === id);
    let newProducts = products;
    if (productIndex >= 0) {
      if (newProducts[productIndex].quantity > 1) {
        newProducts[productIndex].quantity -= 1;
      } else {
        newProducts.splice(productIndex, 1);
      }
      await storeNewProducts(newProducts);
    }
  }, []);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
