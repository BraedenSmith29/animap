import { CircularImage } from '@/components/nodeIcon/CircularImage.tsx';
import { FallbackIcon } from '@/components/nodeIcon/FallbackIcon.tsx';
import * as THREE from 'three';
import type { Node } from '@/types';
import { useEffect, useState, useMemo } from 'react';
import { loadTexture } from '@/utils/textureCache.ts';
import { ColorIcon } from '@/components/nodeIcon/ColorIcon.tsx';
import { useMalIntegration } from '@/context/malIntegration';
import type { ListStatus } from '@/types/list.ts';

interface Props {
    node: Node;
    size: number | undefined;
}

function listStatusColor(status: ListStatus) {
    switch (status) {
        case 'plan_to_watch':
        case 'plan_to_read':
            return '#00D9FF';
        case 'watching':
        case 'reading':
            return '#0049FF';
        case 'completed':
            return '#00FF30';
        case 'on_hold':
            return '#FFC600';
        case 'dropped':
            return '#FF0004';
    }
}

export function GraphNodeIcon({ node, size = 10 }: Props) {
    const [texture, setTexture] = useState<THREE.Texture | null>(null);
    const { animangaList } = useMalIntegration();

    const listStatus = useMemo(() => {
        return animangaList.find(item => item.id === node.id)?.status ?? '';
    }, [node, animangaList]);

    useEffect(() => {
        if (node.nodeType && node.data.nodeImage) {
            loadTexture(node.id, node.data.nodeImage).then(setTexture);
        }
    }, [node]);

    if (!node.nodeType) {
        return <ColorIcon scale={size} color="#F59C27" />;
    } else if (listStatus) {
        return (
            <group>
                <mesh scale={[size, size, 1]}>
                    <circleGeometry args={[1, 64]} />
                    <meshBasicMaterial color={listStatusColor(listStatus)} />
                </mesh>
                {texture ? (
                    <CircularImage texture={texture} scale={size * 0.8} />
                ) : (
                    <FallbackIcon scale={size * 0.8} />
                )}
            </group>
        );
    } else {
        return texture ? <CircularImage texture={texture} scale={size} /> : <FallbackIcon scale={size} />;
    }
}
