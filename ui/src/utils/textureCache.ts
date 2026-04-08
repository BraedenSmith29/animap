import * as THREE from 'three';

const cache = new Map<string, Promise<THREE.Texture>>();

export async function loadTexture(id: string, url: string): Promise<THREE.Texture> {
    if (cache.has(id)) return cache.get(id)!;

    cache.set(id, new Promise((resolve) => {
        const loader = new THREE.TextureLoader();
        loader.load(
            `/api/v1/fetchImage?imageUrl=${encodeURIComponent(url)}`,
            (texture) => resolve(texture),
            undefined,
            (err) => {
                console.error('Error loading texture:', err);
                resolve(new THREE.Texture());
            }
        );
    }));

    return cache.get(id)!;
}