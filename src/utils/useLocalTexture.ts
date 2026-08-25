import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';

export function useLocalTexture(url: string) {
  return useLoader(TextureLoader, url);
}
