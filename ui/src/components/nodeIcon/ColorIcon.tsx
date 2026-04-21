interface Props {
    scale: number;
    color: string;
}

export function ColorIcon({ scale, color }: Props) {
    return (
        <mesh scale={[scale, scale, 1]}>
            <circleGeometry args={[1, 64]} />
            <meshBasicMaterial color={color} />
        </mesh>
    );
}
