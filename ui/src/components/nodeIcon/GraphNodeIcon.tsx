import { CircularImage } from './CircularImage.tsx';
import * as THREE from 'three';
import type { Node } from '../../types/graph.ts';
import { useEffect, useState } from 'react';
import { loadTexture } from '../../utils/textureCache.ts';
import { FallbackIcon } from './FallbackIcon.tsx';

interface Props {
    node: Node;
}

export function GraphNodeIcon({ node }: Props) {
    const [texture, setTexture] = useState<THREE.Texture | null>(null);

    useEffect(() => {
        const nodeImage = node.nodeType === 'anime' ? node.anime.nodeImage : node.manga.nodeImage;
        if (nodeImage) {
            loadTexture(node.id, nodeImage).then(setTexture);
        }
    }, [node]);

    if (texture) {
        return <CircularImage texture={texture} scale={10} />;
    } else {
        return <FallbackIcon scale={10} />;
    }
}
