import './LoadingScreen.css';

interface Props {
    progress: number;
}

export function LoadingScreen({ progress }: Props) {
    return <>
        <div className="loading__overlay">
            <div className="loading__spinner" />
            <p>Building your anime relationship map... {progress} nodes found so far.</p>
        </div>
    </>;
}
