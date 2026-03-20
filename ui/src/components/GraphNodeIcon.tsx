import { CircularImage } from './CircularImage.tsx';

interface Props {
    malUrl: string;
}

export function GraphNodeIcon({ malUrl }: Props) {
    if (!malUrl) return null;

    return <CircularImage
        url={`/api/v1/fetchImage?imageUrl=${encodeURIComponent(malUrl)}`}
        scale={10}
    />;
}