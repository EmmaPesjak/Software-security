import { AbstractControl } from '@angular/forms';

export function postValidation(control: AbstractControl): { [key: string]: boolean } | null {
  const content = control.get('content');
  const username = control.get('username');

  if (!content || content.value.trim() === '') {
    return { 'contentInvalid': true };
  }

  if (!username || username.value.trim() === '') {
    return { 'usernameInvalid': true };
  }

  return null;
}
