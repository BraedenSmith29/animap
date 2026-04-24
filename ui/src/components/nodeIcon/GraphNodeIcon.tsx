import { CircularImage } from '@/components/nodeIcon/CircularImage.tsx';
import { FallbackIcon } from '@/components/nodeIcon/FallbackIcon.tsx';
import * as THREE from 'three';
import type { Node } from '@/types';
import { useEffect, useState } from 'react';
import { loadTexture } from '@/utils/textureCache.ts';
import { ColorIcon } from '@/components/nodeIcon/ColorIcon.tsx';

interface Props {
    node: Node;
}

export function GraphNodeIcon({ node }: Props) {
    const [texture, setTexture] = useState<THREE.Texture | null>(null);

    useEffect(() => {
        if (node.nodeType && node.data.nodeImage) {
            loadTexture(node.id, node.data.nodeImage).then(setTexture);
        }
    }, [node]);

    if (!node.nodeType) {
        return <ColorIcon scale={10} color="#F59C27" />;
    } else if (texture) {
        return <CircularImage texture={texture} scale={10} />;
    } else {
        return <FallbackIcon scale={10} />;
    }
}
