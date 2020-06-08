import api from './api';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
}

async function list(): Promise<Product[]> {
  try {
    const response = await api.get('/products');
    return response.data;
  } catch (error) {
    return [];
  }
}


export { list };
