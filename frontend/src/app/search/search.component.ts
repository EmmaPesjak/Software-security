import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})

/**
 * Component for the search box.
 */
export class SearchComponent {
  enteredSearchValue: string = "";

  // Set up an eventemitter.
  @Output()
  searchTextChanged: EventEmitter<string> = new EventEmitter<string>();

  /**
  * Method for calling the parent component when the search text is changed.
  */
  onSearchTextChanged() {
    this.searchTextChanged.emit(this.enteredSearchValue);
  }
}
