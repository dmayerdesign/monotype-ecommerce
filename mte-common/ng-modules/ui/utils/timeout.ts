import { Observable } from 'rxjs/Observable'
import { ReplaySubject } from 'rxjs/ReplaySubject'

export function timeout(timeout: number): Observable<any > {
    const subject = new ReplaySubject(1)
    const observable = subject.asObservable().delay(timeout)
    subject.next(0)
    return observable
}
