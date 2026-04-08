import * as THREE from 'three';

interface Props {
    texture: THREE.Texture;
    scale: number;
}

export function CircularImage({ texture, scale }: Props) {
    const image = texture.image as HTMLImageElement | undefined;
    if (!image || !image.width || !image.height) {
        return;
    }

    const aspectRatio = image.width / image.height;

    // Center-crop UVs to a square so the circle diameter uses min(width, height).
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

    return (
        <mesh scale={[scale, scale, 1]}>
            <circleGeometry args={[1, 64]} />
            <meshBasicMaterial map={texture} transparent={true} side={THREE.DoubleSide} />
        </mesh>
    );
}

