export type ListStatus = 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch';

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
