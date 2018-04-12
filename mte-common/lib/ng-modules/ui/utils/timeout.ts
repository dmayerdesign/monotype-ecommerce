import { Observable } from 'rxjs/Observable'
import { ReplaySubject } from 'rxjs/ReplaySubject'
import { delay } from 'rxjs/operators/delay'

export function timeout(timeout: number): Observable<any > {
    const subject = new ReplaySubject(1)
    const observable = subject.asObservable().pipe(delay(timeout))
    subject.next(0)
    return observable
}
