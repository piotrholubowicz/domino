import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  readonly VAPID_PUBLIC_KEY =
    'BBv10bLqL5Mhkuggm3rhWfo2gfKCOUBDdmyOAt7o_0TegWajIhXHzFlMND8YRg2vq1qpSOuUB1aJTWLGos-HCHM';
  title = 'domino';
}
