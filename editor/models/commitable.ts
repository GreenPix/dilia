import {Observable} from 'rxjs';

/// This interface must be satisfied for
/// all objects that can be commited through
/// the `CommitModal` interface.
export interface CommitObject {
    name: string;
    is_new: boolean;
}

// Interface to verify when replacing a commit manager
export interface Committer {
    commit(object: CommitObject, message: string): Observable<any>;
}
