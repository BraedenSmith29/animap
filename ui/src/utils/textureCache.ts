import * as THREE from 'three';

const cache = new Map<string, Promise<THREE.Texture | null>>();

export function clearTextureCache() {
    cache.clear();
}

export async function loadTexture(id: string, url: string): Promise<THREE.Texture | null> {
    if (cache.has(id)) return cache.get(id)!;

    cache.set(id, new Promise((resolve) => {
        const loader = new THREE.TextureLoader();
        loader.load(
            `/api/v1/fetchImage?imageUrl=${encodeURIComponent(url)}`,
            (texture) => resolve(processTexture(texture)),
            undefined,
            (err) => {
                console.error('Error loading texture:', err);
                resolve(null);
            }
        );
    }));

    return cache.get(id)!;
}

function processTexture(texture: THREE.Texture) {
    const image = texture.image as HTMLImageElement | undefined;
    if (!image || !image.width || !image.height) {
        return null;
    }

    // Center-crop UVs to a square, so the circle diameter uses min(width, height).
    const aspectRatio = image.width / image.height;
    if (aspectRatio > 1) {
        texture.repeat.set(1 / aspectRatio, 1);
        texture.offset.set((1 - 1 / aspectRatio) / 2, 0);
    } else {
        texture.repeat.set(1, aspectRatio);
        texture.offset.set(0, (1 - aspectRatio) / 2);
    }

    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.needsUpdate = true;

    return texture;
}