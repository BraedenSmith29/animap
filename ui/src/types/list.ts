export type ListStatus =
    | 'watching'
    | 'reading'
    | 'completed'
    | 'on_hold'
    | 'dropped'
    | 'plan_to_watch'
    | 'plan_to_read';

export interface ListItem {
    id: string;
    status: ListStatus;
}

export interface MalListPage {
    data: {
        node: {
            id: string;
        }
        list_status: {
            status: ListStatus;
        }
    }[];
    paging: {
        next?: string;
    };
}
