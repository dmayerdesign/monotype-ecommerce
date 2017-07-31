import { Pipe, PipeTransform } from '@angular/core';
 
@Pipe({
	name: 'sessionStatus',
})
export class SessionStatusPipe implements PipeTransform {  
	transform(value: string): string {
		if (value === "Paid") {
			return "Requested"
		}
		return value;
	}
}