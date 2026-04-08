import { CircularImage } from './CircularImage.tsx';
import * as THREE from 'three';
import type { Anime, Manga, Node } from '../../types/graph.ts';
import { useEffect, useState } from 'react';
import { loadTexture } from '../../utils/textureCache.ts';
import { FallbackIcon } from './FallbackIcon.tsx';

interface Props {
    node: Node;
}

export function GraphNodeIcon({ node }: Props) {
    const [texture, setTexture] = useState<THREE.Texture | null>(null);

    useEffect(() => {
        const media: Anime | Manga = node.nodeType === 'anime' ? node.anime : node.manga;
        if (!media.nodeImage) return;
        loadTexture(media.malId, media.nodeImage).then(setTexture);
    }, [node]);

    if (texture) {
        return <CircularImage texture={texture} scale={10} />;
    } else {
        return <FallbackIcon scale={10} />;
    }
}
