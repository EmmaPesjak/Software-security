import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegisterComponent } from './register/register.component';
import { ForumComponent } from './forum/forum.component';
import { HomeComponent } from './home/home.component';
import { AddPostComponent } from './add-post/add-post.component';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    ForumComponent,
    HomeComponent,
    AddPostComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})

/**
 * Root module of the application.
 */
export class AppModule { }
