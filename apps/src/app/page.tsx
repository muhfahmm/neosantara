import PlayMenuPage from './page/page';
import ErrorBoundary from './ErrorBoundary';

export default function RootEntry() {
    return (
        <ErrorBoundary>
            <PlayMenuPage />
        </ErrorBoundary>
    );
}
