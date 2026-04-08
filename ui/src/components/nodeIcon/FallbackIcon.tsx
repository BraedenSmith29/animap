import { MeshBasicMaterial } from 'three';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

interface Props {
    scale: number;
}

export function FallbackIcon({ scale }: Props) {
    const iconRef = useRef<MeshBasicMaterial>(null);

    useFrame(({ clock }) => {
        if (iconRef.current) {
            iconRef.current.opacity = 0.5 + Math.sin(clock.getElapsedTime() * 3) * 0.12;
        }
    });

    return (
        <mesh scale={[scale, scale, 1]}>
            <circleGeometry args={[1, 64]} />
            <meshBasicMaterial
                ref={iconRef}
                color="#2a2f3a"
                transparent
                opacity={0.5}
            />
        </mesh>
    );
}
