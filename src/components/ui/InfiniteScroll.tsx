import {
    IonContent,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
} from "@ionic/react";
import React from "react";

const InfiniteScroll: React.FC<{
    hasNextPage: any;
    fetchNextPage: any;
    onFetchCompleted?: () => void;
    disabled?: boolean;
}> = ({ hasNextPage, fetchNextPage, onFetchCompleted, disabled }) => {
    return (
        <IonInfiniteScroll
            disabled={disabled || !hasNextPage}
            threshold="150px"
            onIonInfinite={async ($event: any) => {
                if (hasNextPage) {
                    await fetchNextPage();
                    $event.target.complete();
                    onFetchCompleted && onFetchCompleted();
                }

                if (!hasNextPage) {
                    $event.target.disabled = true;
                }
            }}
        >
            <IonInfiniteScrollContent
                loadingSpinner="bubbles"
                loadingText="Loading..."
            ></IonInfiniteScrollContent>
        </IonInfiniteScroll>
    );
};

export default InfiniteScroll;
