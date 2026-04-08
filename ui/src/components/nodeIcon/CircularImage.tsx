import * as THREE from 'three';

interface Props {
    texture: THREE.Texture;
    scale: number;
}

export function CircularImage({ texture, scale }: Props) {
    return (
        <mesh scale={[scale, scale, 1]}>
            <circleGeometry args={[1, 64]} />
            <meshBasicMaterial map={texture} />
        </mesh>
    );
}
